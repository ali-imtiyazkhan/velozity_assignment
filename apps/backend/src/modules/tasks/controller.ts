import type { Request, Response } from 'express';
import {
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  listTasks,
  getMyTasks,
} from './service';
import type { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, GetTaskParams, ListTasksQuery, TaskParams } from './schemas';

export async function createTaskController(req: Request, res: Response) {
  const data = req.body as CreateTaskInput;
  const task = await createTask(data, req.user!.userId, req.user!.role as any);

  res.status(201).json({
    success: true,
    data: { task },
  });
}

export async function getTaskController(req: Request, res: Response) {
  const { id } = req.params as GetTaskParams;
  const task = await getTaskById(id, req.user!.userId, req.user!.role as any);

  res.json({
    success: true,
    data: { task },
  });
}

export async function updateTaskController(req: Request, res: Response) {
  const { id } = req.params as GetTaskParams;
  const data = req.body as UpdateTaskInput;
  const task = await updateTask(id, data, req.user!.userId, req.user!.role as any);

  res.json({
    success: true,
    data: { task },
  });
}

export async function updateTaskStatusController(req: Request, res: Response) {
  const { id } = req.params as GetTaskParams;
  const data = req.body as UpdateTaskStatusInput;
  const task = await updateTaskStatus(id, data, req.user!.userId, req.user!.role as any);

  res.json({
    success: true,
    data: { task },
  });
}

export async function deleteTaskController(req: Request, res: Response) {
  const { id } = req.params as GetTaskParams;
  await deleteTask(id, req.user!.userId, req.user!.role as any);

  res.json({
    success: true,
    data: { message: 'Task deleted successfully' },
  });
}

export async function listTasksController(req: Request, res: Response) {
  const query = req.query as unknown as ListTasksQuery;
  const result = await listTasks(query, req.user!.userId, req.user!.role as any);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}

export async function getMyTasksController(req: Request, res: Response) {
  const query = req.query as unknown as ListTasksQuery;
  const result = await getMyTasks(req.user!.userId, query);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}