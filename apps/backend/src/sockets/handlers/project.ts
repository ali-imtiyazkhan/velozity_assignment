import type { AuthenticatedSocket, ProjectEvent } from '../types';
import type { Server as SocketIOServer } from 'socket.io';
import { joinProjectRoom, leaveProjectRoom } from '../rooms';
import prisma from 'db';
import { ForbiddenError } from '../../shared/errors/AppError';

export function setupProjectHandlers(socket: AuthenticatedSocket, io: SocketIOServer) {
  socket.on('join:project', async (projectId: string) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, managerId: true },
      });

      if (!project) {
        socket.emit('error', { message: 'Project not found' });
        return;
      }

      if (socket.userRole === 'PROJECT_MANAGER' && project.managerId !== socket.userId) {
        socket.emit('error', { message: 'Not your project' });
        return;
      }

      if (socket.userRole === 'DEVELOPER') {
        const assignment = await prisma.task.findFirst({
          where: { projectId, assigneeId: socket.userId },
          select: { id: true },
        });
        if (!assignment) {
          socket.emit('error', { message: 'Not assigned to this project' });
          return;
        }
      }

      joinProjectRoom(socket, projectId);
      socket.emit('project:joined', { projectId });
    } catch {
      socket.emit('error', { message: 'Failed to join project' });
    }
  });

  socket.on('leave:project', (projectId: string) => {
    leaveProjectRoom(socket, projectId);
    socket.emit('project:left', { projectId });
  });
}

export function broadcastProjectUpdate(io: SocketIOServer, projectId: string, action: 'created' | 'updated' | 'deleted', data: Record<string, unknown>) {
  const event: ProjectEvent = { projectId, action, data };
  io.to(`project:${projectId}`).emit('project:updated', event);
}