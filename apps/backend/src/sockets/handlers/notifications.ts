import type { AuthenticatedSocket, NotificationEvent } from '../types';
import type { Server as SocketIOServer } from 'socket.io';
import { broadcastToUser } from '../rooms';
import prisma from 'db';

export function setupNotificationHandlers(socket: AuthenticatedSocket, io: SocketIOServer) {
  socket.on('notification:mark-read', async (notificationId: string) => {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification || notification.userId !== socket.userId) {
        socket.emit('error', { message: 'Notification not found' });
        return;
      }

      if (notification.readAt) {
        socket.emit('notification:read', { notificationId });
        return;
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
      });

      socket.emit('notification:read', { notificationId });

      // Send updated unread count
      const unreadCount = await prisma.notification.count({
        where: { userId: socket.userId, readAt: null },
      });

      socket.emit('notification:count', { count: unreadCount });
    } catch {
      socket.emit('error', { message: 'Failed to mark notification as read' });
    }
  });

  socket.on('notification:mark-all-read', async () => {
    try {
      await prisma.notification.updateMany({
        where: { userId: socket.userId, readAt: null },
        data: { readAt: new Date() },
      });

      socket.emit('notification:count', { count: 0 });
    } catch {
      socket.emit('error', { message: 'Failed to mark all notifications as read' });
    }
  });
}

export function broadcastNotification(io: SocketIOServer, data: {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  taskId: string | null;
  readAt: Date | null;
  createdAt: Date;
  task?: {
    id: string;
    title: string;
    projectId: string;
  } | null;
}) {
  const event: NotificationEvent = {
    ...data,
    readAt: data.readAt?.toISOString() || null,
    createdAt: data.createdAt.toISOString(),
  };

  broadcastToUser(io, data.userId, 'notification:new', event);

  // Also send updated count
  broadcastToUser(io, data.userId, 'notification:count', { count: 1 }); // Will be recalculated on client
}

export async function sendNotificationToUser(io: SocketIOServer, userId: string, notification: {
  type: string;
  title: string;
  message: string;
  taskId?: string;
}) {
  const created = await prisma.notification.create({
    data: {
      type: notification.type as any,
      title: notification.title,
      message: notification.message,
      userId,
      taskId: notification.taskId,
    },
    include: {
      task: { select: { id: true, title: true, projectId: true } },
    },
  });

  broadcastNotification(io, {
    id: created.id,
    type: created.type,
    title: created.title,
    message: created.message,
    userId: created.userId,
    taskId: created.taskId,
    readAt: created.readAt,
    createdAt: created.createdAt,
    task: created.task,
  });
}