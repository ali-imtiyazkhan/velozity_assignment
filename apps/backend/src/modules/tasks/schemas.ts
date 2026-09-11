import { z } from 'zod';
import type { TaskStatus, Priority } from 'db';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(5000).optional().nullable(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('TODO'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    dueDate: z.string().datetime('Invalid due date format'),
    projectId: z.string().cuid('Invalid project ID'),
    assigneeId: z.string().cuid('Invalid assignee ID').optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid task ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255).optional(),
    description: z.string().max(5000).optional().nullable(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    dueDate: z.string().datetime('Invalid due date format').optional(),
    assigneeId: z.string().cuid('Invalid assignee ID').optional().nullable(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid task ID'),
  }),
  body: z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  }),
});

export const getTaskSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid task ID'),
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    projectId: z.string().cuid().optional(),
    assigneeId: z.string().cuid().optional(),
    isOverdue: z.coerce.boolean().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const taskParamsSchema = z.object({
  params: z.object({
    taskId: z.string().cuid('Invalid task ID'),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>['body'];
export type GetTaskParams = z.infer<typeof getTaskSchema>['params'];
export type ListTasksQuery = z.infer<typeof listTasksSchema>['query'];
export type TaskParams = z.infer<typeof taskParamsSchema>['params'];