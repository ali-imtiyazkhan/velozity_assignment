import { Router } from 'express';
import { createUserController, getUserController, getMeController, updateUserController, deleteUserController, listUsersController } from './controller';
import { authMiddleware, requireAdmin } from '../auth/middleware';
import { createUserSchema, updateUserSchema, getUserSchema, listUsersSchema } from './schemas';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authMiddleware);

router.get('/me', getMeController);

router.use(requireAdmin);

router.post('/', validate(createUserSchema), createUserController);
router.get('/', validate(listUsersSchema), listUsersController);
router.get('/:id', validate(getUserSchema), getUserController);
router.patch('/:id', validate(updateUserSchema), updateUserController);
router.delete('/:id', validate(getUserSchema), deleteUserController);

export { router as usersRouter };