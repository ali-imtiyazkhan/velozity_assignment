import { Router } from 'express';
import {
  createTaskController,
  getTaskController,
  updateTaskController,
  updateTaskStatusController,
  deleteTaskController,
  listTasksController,
  getMyTasksController,
} from './controller';
import { authMiddleware, requirePM, requireDeveloper, requireAdmin } from '../auth/middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  getTaskSchema,
  listTasksSchema,
  taskParamsSchema,
} from './schemas';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authMiddleware);

router.post('/', requirePM, validate(createTaskSchema), createTaskController);
router.get('/', validate(listTasksSchema), listTasksController);
router.get('/my-tasks', requireDeveloper, validate(listTasksSchema), getMyTasksController);
router.get('/:id', validate(getTaskSchema), getTaskController);
router.patch('/:id', validate(updateTaskSchema), updateTaskController);
router.patch('/:taskId/status', validate(taskParamsSchema), validate(updateTaskStatusSchema), updateTaskStatusController);
router.delete('/:id', validate(getTaskSchema), deleteTaskController);

export { router as tasksRouter };