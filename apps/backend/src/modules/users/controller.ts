import type { Request, Response } from 'express';
import { createUser, getUserById, updateUser, deleteUser, listUsers } from './service';
import type { CreateUserInput, UpdateUserInput, GetUserParams, ListUsersQuery } from './schemas';

export async function createUserController(req: Request, res: Response) {
  const data = req.body as CreateUserInput;
  const user = await createUser(data);

  res.status(201).json({
    success: true,
    data: { user },
  });
}

export async function getUserController(req: Request, res: Response) {
  const { id } = req.params as GetUserParams;
  const user = await getUserById(id);

  res.json({
    success: true,
    data: { user },
  });
}

export async function getMeController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
    });
  }

  const user = await getUserById(req.user.userId);

  res.json({
    success: true,
    data: { user },
  });
}

export async function updateUserController(req: Request, res: Response) {
  const { id } = req.params as GetUserParams;
  const data = req.body as UpdateUserInput;
  const user = await updateUser(id, data);

  res.json({
    success: true,
    data: { user },
  });
}

export async function deleteUserController(req: Request, res: Response) {
  const { id } = req.params as GetUserParams;
  await deleteUser(id);

  res.json({
    success: true,
    data: { message: 'User deleted successfully' },
  });
}

export async function listUsersController(req: Request, res: Response) {
  const query = req.query as unknown as ListUsersQuery;
  const result = await listUsers(query);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}