import { Router } from 'express';
import { getDashboardController } from './controller';
import { authMiddleware } from '../auth/middleware';
import { dashboardQuerySchema } from './schemas';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(dashboardQuerySchema), getDashboardController);
router.get('/admin', validate(dashboardQuerySchema), getDashboardController);
router.get('/pm', validate(dashboardQuerySchema), getDashboardController);
router.get('/developer', validate(dashboardQuerySchema), getDashboardController);

export { router as dashboardRouter };