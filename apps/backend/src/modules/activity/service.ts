import prisma from 'db';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import type { Role } from 'db';
import type { ListActivityQuery, ActivityParams } from './schemas';

export interface ActivityLogResponse {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  userId: string;
  projectId: string;
  taskId: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  project: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    title: string;
  } | null;
}

export async function createActivityLog(data: {
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  userId: string;
  projectId: string;
  taskId?: string | null;
}) {
  return prisma.activityLog.create({
    data: {
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldValue: data.oldValue ?? null,
      newValue: data.newValue ?? null,
      userId: data.userId,
      projectId: data.projectId,
      taskId: data.taskId ?? null,
    },
  });
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

export async function listActivityLogs(query: ListActivityQuery, userId: string, userRole: Role) {
  const { page, limit, projectId, userId: filterUserId, taskId, action, entityType, startDate, endDate } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (userRole === 'DEVELOPER') {
    const assignedTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      select: { id: true },
    });
    const taskIds = assignedTasks.map(t => t.id);
    where.OR = [
      { taskId: { in: taskIds } },
      { userId },
    ];
  } else if (userRole === 'PROJECT_MANAGER') {
    const managedProjects = await prisma.project.findMany({
      where: { managerId: userId },
      select: { id: true },
    });
    const projectIds = managedProjects.map(p => p.id);
    where.projectId = { in: projectIds };
  }

  if (projectId) {
    if (userRole === 'PROJECT_MANAGER') {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { managerId: true },
      });
      if (project?.managerId !== userId) {
        throw new ForbiddenError('Not your project');
      }
    } else if (userRole === 'DEVELOPER') {
      const assignment = await prisma.task.findFirst({
        where: { projectId, assigneeId: userId },
        select: { id: true },
      });
      if (!assignment) {
        throw new ForbiddenError('Not assigned to this project');
      }
    }
    where.projectId = projectId;
  }

  if (filterUserId) where.userId = filterUserId;
  if (taskId) where.taskId = taskId;
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;

  if (startDate || endDate) {
    const createdAtFilter: Record<string, Date> = {};
    if (startDate) createdAtFilter.gte = new Date(startDate);
    if (endDate) createdAtFilter.lte = new Date(endDate);
    where.createdAt = createdAtFilter;
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    data: logs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProjectActivity(projectId: string, query: ListActivityQuery, userId: string, userRole: Role) {
  await verifyProjectAccess(projectId, userId, userRole);
  return listActivityLogs({ ...query, projectId }, userId, userRole);
}

export async function getRecentActivity(userId: string, userRole: Role, limit = 20) {
  let where: Record<string, unknown> = {};

  if (userRole === 'DEVELOPER') {
    const assignedTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      select: { id: true },
    });
    const taskIds = assignedTasks.map(t => t.id);
    where.OR = [
      { taskId: { in: taskIds } },
      { userId },
    ];
  } else if (userRole === 'PROJECT_MANAGER') {
    const managedProjects = await prisma.project.findMany({
      where: { managerId: userId },
      select: { id: true },
    });
    const projectIds = managedProjects.map(p => p.id);
    where.projectId = { in: projectIds };
  }

  const logs = await prisma.activityLog.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      project: { select: { id: true, name: true } },
      task: { select: { id: true, title: true } },
    },
  });

  return logs;
}