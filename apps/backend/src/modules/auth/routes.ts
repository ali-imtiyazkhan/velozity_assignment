import { Router } from 'express';
import { registerController, loginController, refreshController, logoutController, meController } from './controller';
import { authMiddleware } from './middleware';
import { registerSchema, loginSchema, refreshSchema } from './schemas';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.post('/refresh', validate(refreshSchema), refreshController);
router.post('/logout', logoutController);
router.get('/me', authMiddleware, meController);

export { router as authRouter };