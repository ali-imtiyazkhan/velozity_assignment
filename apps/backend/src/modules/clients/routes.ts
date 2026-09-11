import { Router } from 'express';
import { createClientController, getClientController, updateClientController, deleteClientController, listClientsController } from './controller';
import { authMiddleware, requireAdmin } from '../auth/middleware';
import { createClientSchema, updateClientSchema, getClientSchema, listClientsSchema } from './schemas';
import { validate } from '../../shared/middleware/validate';

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.post('/', validate(createClientSchema), createClientController);
router.get('/', validate(listClientsSchema), listClientsController);
router.get('/:id', validate(getClientSchema), getClientController);
router.patch('/:id', validate(updateClientSchema), updateClientController);
router.delete('/:id', validate(getClientSchema), deleteClientController);

export { router as clientsRouter };