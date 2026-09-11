import { Router } from 'express';
import { listActivityController, getProjectActivityController, getRecentActivityController } from './controller';
import { authMiddleware } from '../auth/middleware';
import { listActivitySchema, activityParamsSchema } from './schemas';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(listActivitySchema), listActivityController);
router.get('/recent', getRecentActivityController);
router.get('/project/:projectId', validate(activityParamsSchema), validate(listActivitySchema), getProjectActivityController);

export { router as activityRouter };