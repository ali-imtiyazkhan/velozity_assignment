import prisma from 'db';
import { NotFoundError, ForbiddenError, ConflictError } from '../../shared/errors/AppError';
import { createActivityLog } from '../activity/service';
import type { Role, TaskStatus, Priority } from 'db';
import type { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, ListTasksQuery, TaskParams } from './schemas';

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date;
  isOverdue: boolean;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    name: string;
    clientId: string;
    managerId: string;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    activityLogs: number;
    notifications: number;
  };
}

export interface TaskListItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date;
  isOverdue: boolean;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    name: string;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
}

async function verifyProjectAccess(projectId: string, userId: string, userRole: Role) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, managerId: true },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (userRole === 'PROJECT_MANAGER' && project.managerId !== userId) {
    throw new ForbiddenError('Not your project');
  }

  if (userRole === 'DEVELOPER') {
    const assignment = await prisma.task.findFirst({
      where: { projectId, assigneeId: userId },
      select: { id: true },
    });
    if (!assignment) {
      throw new ForbiddenError('Not assigned to this project');
    }
  }

  return project;
}

async function verifyTaskAccess(taskId: string, userId: string, userRole: Role) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { 
      id: true, 
      projectId: true, 
      assigneeId: true, 
      creatorId: true, 
      status: true,
      dueDate: true,
      title: true,
      project: { select: { managerId: true } } 
    },
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  if (userRole === 'ADMIN') return task;

  if (userRole === 'PROJECT_MANAGER') {
    if (task.project.managerId !== userId) {
      throw new ForbiddenError('Not your project');
    }
    return task;
  }

  if (userRole === 'DEVELOPER') {
    if (task.assigneeId !== userId) {
      throw new ForbiddenError('Not your task');
    }
    return task;
  }

  throw new ForbiddenError('Insufficient permissions');
}

function isValidStatusTransition(currentStatus: TaskStatus, newStatus: TaskStatus): boolean {
  const validTransitions: Record<TaskStatus, TaskStatus[]> = {
    TODO: ['IN_PROGRESS'],
    IN_PROGRESS: ['IN_REVIEW', 'TODO'],
    IN_REVIEW: ['DONE', 'IN_PROGRESS'],
    DONE: ['IN_REVIEW'],
  };
  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

export async function createTask(data: CreateTaskInput, userId: string, userRole: Role): Promise<TaskResponse> {
  await verifyProjectAccess(data.projectId, userId, userRole);

  if (data.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: data.assigneeId },
      select: { id: true, role: true },
    });
    if (!assignee) {
      throw new NotFoundError('Assignee not found');
    }
    if (assignee.role !== 'DEVELOPER') {
      throw new ConflictError('Assignee must be a Developer');
    }

    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { managerId: true },
    });
    if (userRole === 'PROJECT_MANAGER' && project?.managerId !== userId) {
      throw new ForbiddenError('Not your project');
    }
  }

  const dueDate = new Date(data.dueDate);
  const isOverdue = dueDate < new Date() && data.status !== 'DONE';

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate,
      isOverdue,
      projectId: data.projectId,
      assigneeId: data.assigneeId,
      creatorId: userId,
    },
    include: {
      project: { select: { id: true, name: true, clientId: true, managerId: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { activityLogs: true, notifications: true } },
    },
  });

  await createActivityLog({
    action: 'CREATED',
    entityType: 'TASK',
    entityId: task.id,
    newValue: JSON.stringify({ status: task.status, priority: task.priority }),
    userId,
    projectId: task.projectId,
    taskId: task.id,
  });

  if (data.assigneeId) {
    await prisma.notification.create({
      data: {
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `You have been assigned to "${task.title}"`,
        userId: data.assigneeId,
        taskId: task.id,
      },
    });
  }

  return task;
}

export async function getTaskById(id: string, userId: string, userRole: Role): Promise<TaskResponse> {
  const task = await verifyTaskAccess(id, userId, userRole);

  const fullTask = await prisma.task.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true, clientId: true, managerId: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { activityLogs: true, notifications: true } },
    },
  });

  return fullTask!;
}

export async function updateTask(id: string, data: UpdateTaskInput, userId: string, userRole: Role): Promise<TaskResponse> {
  const task = await verifyTaskAccess(id, userId, userRole);

  if (data.assigneeId !== undefined) {
    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assigneeId },
        select: { id: true, role: true },
      });
      if (!assignee) {
        throw new NotFoundError('Assignee not found');
      }
      if (assignee.role !== 'DEVELOPER') {
        throw new ConflictError('Assignee must be a Developer');
      }
    }
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.dueDate) {
    updateData.dueDate = new Date(data.dueDate);
    updateData.isOverdue = new Date(data.dueDate) < new Date() && (data.status ?? task.status) !== 'DONE';
  }

  if (data.status && data.status !== task.status) {
    if (!isValidStatusTransition(task.status, data.status)) {
      throw new ConflictError(`Invalid status transition from ${task.status} to ${data.status}`);
    }
    updateData.isOverdue = (updateData.dueDate ?? task.dueDate) < new Date() && data.status !== 'DONE';
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: updateData,
    include: {
      project: { select: { id: true, name: true, clientId: true, managerId: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { activityLogs: true, notifications: true } },
    },
  });

  if (data.status && data.status !== task.status) {
    await createActivityLog({
      action: 'STATUS_CHANGED',
      entityType: 'TASK',
      entityId: task.id,
      oldValue: task.status,
      newValue: data.status,
      userId,
      projectId: task.projectId,
      taskId: task.id,
    });

    if (data.status === 'IN_REVIEW' && task.project.managerId) {
      await prisma.notification.create({
        data: {
          type: 'TASK_IN_REVIEW',
          title: 'Task Ready for Review',
          message: `"${task.title}" is ready for review`,
          userId: task.project.managerId,
          taskId: task.id,
        },
      });
    }
  }

  return updatedTask;
}

export async function updateTaskStatus(id: string, data: UpdateTaskStatusInput, userId: string, userRole: Role): Promise<TaskResponse> {
  const task = await verifyTaskAccess(id, userId, userRole);

  if (!isValidStatusTransition(task.status, data.status)) {
    throw new ConflictError(`Invalid status transition from ${task.status} to ${data.status}`);
  }

  const isOverdue = task.dueDate < new Date() && data.status !== 'DONE';

  const updatedTask = await prisma.task.update({
    where: { id },
    data: { status: data.status, isOverdue },
    include: {
      project: { select: { id: true, name: true, clientId: true, managerId: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true } },
      _count: { select: { activityLogs: true, notifications: true } },
    },
  });

  await createActivityLog({
    action: 'STATUS_CHANGED',
    entityType: 'TASK',
    entityId: task.id,
    oldValue: task.status,
    newValue: data.status,
    userId,
    projectId: task.projectId,
    taskId: task.id,
  });

  if (data.status === 'IN_REVIEW' && task.project.managerId) {
    await prisma.notification.create({
      data: {
        type: 'TASK_IN_REVIEW',
        title: 'Task Ready for Review',
        message: `"${task.title}" is ready for review`,
        userId: task.project.managerId,
        taskId: task.id,
      },
    });
  }

  if (data.status === 'DONE' && task.assigneeId) {
    await prisma.notification.create({
      data: {
        type: 'STATUS_CHANGED',
        title: 'Task Completed',
        message: `"${task.title}" has been marked as done`,
        userId: task.assigneeId,
        taskId: task.id,
      },
    });
  }

  return updatedTask;
}

export async function deleteTask(id: string, userId: string, userRole: Role): Promise<void> {
  const task = await verifyTaskAccess(id, userId, userRole);

  if (userRole === 'DEVELOPER' && task.creatorId !== userId) {
    throw new ForbiddenError('Cannot delete task created by another user');
  }

  await prisma.task.delete({
    where: { id },
  });

  await createActivityLog({
    action: 'DELETED',
    entityType: 'TASK',
    entityId: id,
    userId,
    projectId: task.projectId,
    taskId: id,
  });
}

export async function listTasks(query: ListTasksQuery, userId: string, userRole: Role) {
  const { page, limit, status, priority, projectId, assigneeId, isOverdue, search, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (userRole === 'DEVELOPER') {
    where.assigneeId = userId;
  } else if (assigneeId) {
    where.assigneeId = assigneeId;
  }

  if (userRole === 'PROJECT_MANAGER') {
    const managedProjects = await prisma.project.findMany({
      where: { managerId: userId },
      select: { id: true },
    });
    const projectIds = managedProjects.map(p => p.id);
    if (projectId) {
      if (!projectIds.includes(projectId)) {
        throw new ForbiddenError('Not your project');
      }
      where.projectId = projectId;
    } else {
      where.projectId = { in: projectIds };
    }
  } else if (projectId) {
    where.projectId = projectId;
  }

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (isOverdue !== undefined) where.isOverdue = isOverdue;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    data: tasks,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getMyTasks(userId: string, query: ListTasksQuery) {
  return listTasks({ ...query, assigneeId: userId }, userId, 'DEVELOPER');
}