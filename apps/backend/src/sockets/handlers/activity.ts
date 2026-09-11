import type { AuthenticatedSocket, ActivityEvent } from '../types';
import type { Server as SocketIOServer } from 'socket.io';
import { broadcastToProject, broadcastToUser, broadcastToAdmins, broadcastToPm } from '../rooms';
import prisma from 'db';

export function setupActivityHandlers(socket: AuthenticatedSocket, io: SocketIOServer) {
  socket.on('activity:fetch', async (data: { projectId?: string; limit?: number }) => {
    try {
      const { projectId, limit = 20 } = data;
      let where: Record<string, unknown> = {};

      if (socket.userRole === 'DEVELOPER') {
        const assignedTasks = await prisma.task.findMany({
          where: { assigneeId: socket.userId },
          select: { id: true },
        });
        const taskIds = assignedTasks.map(t => t.id);
        where.OR = [
          { taskId: { in: taskIds } },
          { userId: socket.userId },
        ];
      } else if (socket.userRole === 'PROJECT_MANAGER') {
        const managedProjects = await prisma.project.findMany({
          where: { managerId: socket.userId },
          select: { id: true },
        });
        const projectIds = managedProjects.map(p => p.id);
        where.projectId = { in: projectIds };
      }

      if (projectId) {
        if (socket.userRole === 'PROJECT_MANAGER') {
          const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { managerId: true },
          });
          if (project?.managerId !== socket.userId) {
            socket.emit('error', { message: 'Not your project' });
            return;
          }
        } else if (socket.userRole === 'DEVELOPER') {
          const assignment = await prisma.task.findFirst({
            where: { projectId, assigneeId: socket.userId },
            select: { id: true },
          });
          if (!assignment) {
            socket.emit('error', { message: 'Not assigned to this project' });
            return;
          }
        }
        where.projectId = projectId;
      }

      const logs = await prisma.activityLog.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      });

      const events: ActivityEvent[] = logs.map(log => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        oldValue: log.oldValue,
        newValue: log.newValue,
        userId: log.userId,
        projectId: log.projectId,
        taskId: log.taskId,
        createdAt: log.createdAt.toISOString(),
        user: {
          id: log.user.id,
          name: log.user.name,
          email: log.user.email,
          avatarUrl: log.user.avatarUrl,
        },
      }));

      socket.emit('activity:catchup', events);
    } catch {
      socket.emit('error', { message: 'Failed to fetch activity' });
    }
  });
}

export async function broadcastActivity(io: SocketIOServer, data: {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  userId: string;
  projectId: string;
  taskId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}) {
  const event: ActivityEvent = {
    ...data,
    createdAt: new Date().toISOString(),
  };

  // Broadcast to project room
  broadcastToProject(io, data.projectId, 'activity:new', event);

  // Broadcast to admins
  broadcastToAdmins(io, 'activity:new', event);

  // Broadcast to PM if they manage this project
  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
    select: { managerId: true },
  });
  if (project?.managerId) {
    broadcastToPm(io, project.managerId, 'activity:new', event);
  }

  // Broadcast to task assignee if applicable
  if (data.taskId) {
    const task = await prisma.task.findUnique({
      where: { id: data.taskId },
      select: { assigneeId: true },
    });
    if (task?.assigneeId) {
      broadcastToUser(io, task.assigneeId, 'activity:new', event);
    }
  }
}