import prisma from 'db';
import { NotFoundError } from '../../shared/errors/AppError';
import type { ListNotificationsQuery, MarkReadParams, MarkAllReadInput } from './schemas';

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  taskId: string | null;
  readAt: Date | null;
  createdAt: Date;
  task: {
    id: string;
    title: string;
    projectId: string;
  } | null;
}

export async function listNotifications(query: ListNotificationsQuery, userId: string) {
  const { page, limit, read, type } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId };

  if (read !== undefined) {
    where.readAt = read ? { not: null } : null;
  }

  if (type) {
    where.type = type;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        task: { select: { id: true, title: true, projectId: true } },
      },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return {
    data: notifications,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    },
  };
}

export async function markAsRead(id: string, userId: string): Promise<NotificationResponse> {
  const notification = await prisma.notification.findUnique({
    where: { id },
    include: {
      task: { select: { id: true, title: true, projectId: true } },
    },
  });

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  if (notification.userId !== userId) {
    throw new NotFoundError('Notification not found');
  }

  if (notification.readAt) {
    return notification as NotificationResponse;
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
    include: {
      task: { select: { id: true, title: true, projectId: true } },
    },
  });

  return updated as NotificationResponse;
}

export async function markAllAsRead(userId: string, notificationIds?: string[]): Promise<number> {
  const where: Record<string, unknown> = {
    userId,
    readAt: null,
  };

  if (notificationIds && notificationIds.length > 0) {
    where.id = { in: notificationIds };
  }

  const result = await prisma.notification.updateMany({
    where,
    data: { readAt: new Date() },
  });

  return result.count;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function deleteNotification(id: string, userId: string): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  if (notification.userId !== userId) {
    throw new NotFoundError('Notification not found');
  }

  await prisma.notification.delete({
    where: { id },
  });
}