import type { Request, Response } from 'express';
import { listNotifications, markAsRead, markAllAsRead, getUnreadCount, deleteNotification } from './service';
import type { ListNotificationsQuery, MarkReadParams, MarkAllReadInput } from './schemas';

export async function listNotificationsController(req: Request, res: Response) {
  const query = req.query as unknown as ListNotificationsQuery;
  const result = await listNotifications(query, req.user!.userId);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}

export async function markAsReadController(req: Request, res: Response) {
  const { id } = req.params as MarkReadParams;
  const notification = await markAsRead(id, req.user!.userId);

  res.json({
    success: true,
    data: { notification },
  });
}

export async function markAllAsReadController(req: Request, res: Response) {
  const { notificationIds } = req.body as MarkAllReadInput;
  const count = await markAllAsRead(req.user!.userId, notificationIds);

  res.json({
    success: true,
    data: { markedCount: count },
  });
}

export async function getUnreadCountController(req: Request, res: Response) {
  const count = await getUnreadCount(req.user!.userId);

  res.json({
    success: true,
    data: { unreadCount: count },
  });
}

export async function deleteNotificationController(req: Request, res: Response) {
  const { id } = req.params as MarkReadParams;
  await deleteNotification(id, req.user!.userId);

  res.json({
    success: true,
    data: { message: 'Notification deleted' },
  });
}