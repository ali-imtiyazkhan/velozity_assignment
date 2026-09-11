import { Router } from 'express';
import {
  listNotificationsController,
  markAsReadController,
  markAllAsReadController,
  getUnreadCountController,
  deleteNotificationController,
} from './controller';
import { authMiddleware } from '../auth/middleware';
import { listNotificationsSchema, markReadSchema, markAllReadSchema } from './schemas';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(listNotificationsSchema), listNotificationsController);
router.get('/unread-count', getUnreadCountController);
router.patch('/:id/read', validate(markReadSchema), markAsReadController);
router.patch('/read-all', validate(markAllReadSchema), markAllAsReadController);
router.delete('/:id', validate(markReadSchema), deleteNotificationController);

export { router as notificationsRouter };