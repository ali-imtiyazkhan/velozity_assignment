import prisma from 'db';
import { NotFoundError, ConflictError, ForbiddenError } from '../../shared/errors/AppError';
import type { Role } from 'db';
import type { CreateProjectInput, UpdateProjectInput, ListProjectsQuery, ProjectParams } from './schemas';

export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  managerId: string;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
  manager: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  _count: {
    tasks: number;
  };
}

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  managerId: string;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    name: string;
    email: string;
  };
  manager: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    tasks: number;
  };
}

async function verifyClientExists(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });
  if (!client) {
    throw new NotFoundError('Client not found');
  }
}

async function verifyManagerExists(managerId: string) {
  const manager = await prisma.user.findUnique({
    where: { id: managerId },
  });
  if (!manager) {
    throw new NotFoundError('Manager not found');
  }
  if (manager.role !== 'PROJECT_MANAGER' && manager.role !== 'ADMIN') {
    throw new ConflictError('User must be a Project Manager or Admin');
  }
}

export async function createProject(data: CreateProjectInput, userId: string, userRole: Role): Promise<ProjectResponse> {
  await verifyClientExists(data.clientId);

  const managerId = data.managerId || (userRole === 'PROJECT_MANAGER' ? userId : undefined);

  if (managerId) {
    await verifyManagerExists(managerId);
  }

  if (userRole === 'PROJECT_MANAGER' && !data.managerId) {
    // PM can only create projects for themselves
  } else if (userRole === 'PROJECT_MANAGER' && data.managerId !== userId) {
    throw new ForbiddenError('Project Managers can only create projects for themselves');
  }

  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      clientId: data.clientId,
      managerId: managerId!,
    },
    include: {
      client: {
        select: { id: true, name: true, email: true, company: true },
      },
      manager: {
        select: { id: true, name: true, email: true, role: true },
      },
      _count: {
        select: { tasks: true },
      },
    },
  });

  return project;
}

export async function getProjectById(id: string): Promise<ProjectResponse> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: {
        select: { id: true, name: true, email: true, company: true },
      },
      manager: {
        select: { id: true, name: true, email: true, role: true },
      },
      _count: {
        select: { tasks: true },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  return project;
}

export async function updateProject(id: string, data: UpdateProjectInput, userId: string, userRole: Role): Promise<ProjectResponse> {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (userRole === 'PROJECT_MANAGER' && project.managerId !== userId) {
    throw new ForbiddenError('Not your project');
  }

  if (data.clientId) {
    await verifyClientExists(data.clientId);
  }

  if (data.managerId) {
    await verifyManagerExists(data.managerId);
  }

  if (userRole === 'PROJECT_MANAGER' && data.managerId && data.managerId !== userId) {
    throw new ForbiddenError('Project Managers can only assign projects to themselves');
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      clientId: data.clientId,
      managerId: data.managerId ?? undefined,
    },
    include: {
      client: {
        select: { id: true, name: true, email: true, company: true },
      },
      manager: {
        select: { id: true, name: true, email: true, role: true },
      },
      _count: {
        select: { tasks: true },
      },
    },
  });

  return updatedProject;
}

export async function deleteProject(id: string, userId: string, userRole: Role): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (userRole === 'PROJECT_MANAGER' && project.managerId !== userId) {
    throw new ForbiddenError('Not your project');
  }

  await prisma.project.delete({
    where: { id },
  });
}

export async function listProjects(query: ListProjectsQuery, userId: string, userRole: Role) {
  const { page, limit, search, managerId, clientId } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (userRole === 'PROJECT_MANAGER') {
    where.managerId = userId;
  } else if (managerId) {
    where.managerId = managerId;
  }

  if (clientId) {
    where.clientId = clientId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { client: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        manager: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: projects,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProjectStats(projectId: string, userId: string, userRole: Role) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (userRole === 'PROJECT_MANAGER' && project.managerId !== userId) {
    throw new ForbiddenError('Not your project');
  }

  const [tasksByStatus, tasksByPriority, overdueCount, totalTasks] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: { projectId },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { projectId },
      _count: true,
    }),
    prisma.task.count({
      where: {
        projectId,
        isOverdue: true,
        status: { not: 'DONE' },
      },
    }),
    prisma.task.count({ where: { projectId } }),
  ]);

  return {
    totalTasks,
    overdueCount,
    tasksByStatus: tasksByStatus.reduce((acc, t) => ({ ...acc, [t.status]: t._count }), {}),
    tasksByPriority: tasksByPriority.reduce((acc, t) => ({ ...acc, [t.priority]: t._count }), {}),
  };
}