import { Router } from 'express';
import {
  createProjectController,
  getProjectController,
  updateProjectController,
  deleteProjectController,
  listProjectsController,
  getProjectStatsController,
  listProjectTasksController,
  listProjectActivityController,
} from './controller';
import { authMiddleware, requirePM, requireAdmin } from '../auth/middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  getProjectSchema,
  listProjectsSchema,
  projectParamsSchema,
} from './schemas';
import { listTasksSchema } from '../tasks/schemas';
import { listActivitySchema } from '../activity/schemas';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authMiddleware);

router.post('/', requirePM, validate(createProjectSchema), createProjectController);
router.get('/', validate(listProjectsSchema), listProjectsController);
router.get('/:id', validate(getProjectSchema), getProjectController);
router.get('/:projectId/stats', validate(projectParamsSchema), getProjectStatsController);
router.get('/:projectId/tasks', validate(listTasksSchema), listProjectTasksController);
router.get('/:projectId/activity', validate(listActivitySchema), listProjectActivityController);
router.patch('/:id', validate(updateProjectSchema), updateProjectController);
router.delete('/:id', validate(getProjectSchema), deleteProjectController);

export { router as projectsRouter };