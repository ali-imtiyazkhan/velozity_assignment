import prisma from 'db';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import type { Role } from 'db';
import type { DashboardQuery } from './schemas';

export interface AdminDashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  overdueTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  usersByRole: Record<string, number>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    projectId: string;
    createdAt: Date;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }>;
  onlineUsers: number;
}

export interface PMDashboardStats {
  myProjects: number;
  totalTasks: number;
  overdueTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    dueDate: Date;
    priority: string;
    project: { id: string; name: string };
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    projectId: string;
    createdAt: Date;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }>;
}

export interface DeveloperDashboardStats {
  assignedTasks: number;
  overdueTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: Date;
    priority: string;
    status: string;
    project: { id: string; name: string };
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    projectId: string;
    createdAt: Date;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }>;
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

  return project;
}

export async function getAdminDashboard(query: DashboardQuery): Promise<AdminDashboardStats> {
  const { projectId } = query;

  const projectFilter = projectId ? { projectId } : {};

  const [
    totalUsers,
    totalProjects,
    totalTasks,
    overdueTasks,
    tasksByStatus,
    tasksByPriority,
    usersByRole,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.task.count({ where: projectFilter }),
    prisma.task.count({
      where: { ...projectFilter, isOverdue: true, status: { not: 'DONE' } },
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: projectFilter,
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: projectFilter,
      _count: true,
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    }),
  ]);

  return {
    totalUsers,
    totalProjects,
    totalTasks,
    overdueTasks,
    tasksByStatus: tasksByStatus.reduce((acc, t) => ({ ...acc, [t.status]: t._count }), {}),
    tasksByPriority: tasksByPriority.reduce((acc, t) => ({ ...acc, [t.priority]: t._count }), {}),
    usersByRole: usersByRole.reduce((acc, u) => ({ ...acc, [u.role]: u._count }), {}),
    recentActivity,
    onlineUsers: 0, // Will be populated by socket service
  };
}

export async function getPMDashboard(userId: string, query: DashboardQuery): Promise<PMDashboardStats> {
  const { projectId } = query;

  const managedProjects = await prisma.project.findMany({
    where: { managerId: userId },
    select: { id: true },
  });
  const projectIds = managedProjects.map(p => p.id);

  if (projectId && !projectIds.includes(projectId)) {
    throw new ForbiddenError('Not your project');
  }

  const filterProjectIds = projectId ? [projectId] : projectIds;

  const [
    totalTasks,
    overdueTasks,
    tasksByStatus,
    tasksByPriority,
    upcomingDeadlines,
    recentActivity,
  ] = await Promise.all([
    prisma.task.count({ where: { projectId: { in: filterProjectIds } } }),
    prisma.task.count({
      where: { projectId: { in: filterProjectIds }, isOverdue: true, status: { not: 'DONE' } },
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: { projectId: { in: filterProjectIds } },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { projectId: { in: filterProjectIds } },
      _count: true,
    }),
    prisma.task.findMany({
      where: {
        projectId: { in: filterProjectIds },
        status: { not: 'DONE' },
        dueDate: { gte: new Date() },
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        title: true,
        dueDate: true,
        priority: true,
        project: { select: { id: true, name: true } },
      },
    }),
    prisma.activityLog.findMany({
      where: { projectId: { in: filterProjectIds } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    }),
  ]);

  return {
    myProjects: managedProjects.length,
    totalTasks,
    overdueTasks,
    tasksByStatus: tasksByStatus.reduce((acc, t) => ({ ...acc, [t.status]: t._count }), {}),
    tasksByPriority: tasksByPriority.reduce((acc, t) => ({ ...acc, [t.priority]: t._count }), {}),
    upcomingDeadlines,
    recentActivity,
  };
}

export async function getDeveloperDashboard(userId: string, query: DashboardQuery): Promise<DeveloperDashboardStats> {
  const { projectId } = query;

  const assignedTasks = await prisma.task.findMany({
    where: { assigneeId: userId, ...(projectId ? { projectId } : {}) },
    select: { id: true, projectId: true },
  });

  const taskIds = assignedTasks.map(t => t.id);
  const projectIds = [...new Set(assignedTasks.map(t => t.projectId))];

  if (projectId && !projectIds.includes(projectId)) {
    throw new ForbiddenError('Not assigned to this project');
  }

  const [
    totalTasks,
    overdueTasks,
    tasksByStatus,
    tasksByPriority,
    upcomingTasks,
    recentActivity,
  ] = await Promise.all([
    prisma.task.count({ where: { assigneeId: userId, ...(projectId ? { projectId } : {}) } }),
    prisma.task.count({
      where: { assigneeId: userId, isOverdue: true, status: { not: 'DONE' }, ...(projectId ? { projectId } : {}) },
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: { assigneeId: userId, ...(projectId ? { projectId } : {}) },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { assigneeId: userId, ...(projectId ? { projectId } : {}) },
      _count: true,
    }),
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' },
        dueDate: { gte: new Date() },
        ...(projectId ? { projectId } : {}),
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        title: true,
        dueDate: true,
        priority: true,
        status: true,
        project: { select: { id: true, name: true } },
      },
    }),
    prisma.activityLog.findMany({
      where: { OR: [{ taskId: { in: taskIds } }, { userId }] },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    }),
  ]);

  return {
    assignedTasks: totalTasks,
    overdueTasks,
    tasksByStatus: tasksByStatus.reduce((acc, t) => ({ ...acc, [t.status]: t._count }), {}),
    tasksByPriority: tasksByPriority.reduce((acc, t) => ({ ...acc, [t.priority]: t._count }), {}),
    upcomingTasks,
    recentActivity,
  };
}

export async function getDashboardStats(userId: string, userRole: Role, query: DashboardQuery) {
  switch (userRole) {
    case 'ADMIN':
      return getAdminDashboard(query);
    case 'PROJECT_MANAGER':
      return getPMDashboard(userId, query);
    case 'DEVELOPER':
      return getDeveloperDashboard(userId, query);
    default:
      throw new Error('Unknown role');
  }
}