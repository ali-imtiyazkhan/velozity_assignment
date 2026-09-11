import { z } from 'zod';
import type { Role } from 'db';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().max(2000).optional().nullable(),
    clientId: z.string().cuid('Invalid client ID'),
    managerId: z.string().cuid('Invalid manager ID').optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid project ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255).optional(),
    description: z.string().max(2000).optional().nullable(),
    clientId: z.string().cuid('Invalid client ID').optional(),
    managerId: z.string().cuid('Invalid manager ID').optional().nullable(),
  }),
});

export const getProjectSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid project ID'),
  }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    status: z.string().optional(),
    managerId: z.string().cuid().optional(),
    clientId: z.string().cuid().optional(),
  }),
});

export const projectParamsSchema = z.object({
  params: z.object({
    projectId: z.string().cuid('Invalid project ID'),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
export type GetProjectParams = z.infer<typeof getProjectSchema>['params'];
export type ListProjectsQuery = z.infer<typeof listProjectsSchema>['query'];
export type ProjectParams = z.infer<typeof projectParamsSchema>['params'];