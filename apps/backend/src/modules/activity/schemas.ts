import { z } from 'zod';

export const listActivitySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    projectId: z.string().cuid().optional(),
    userId: z.string().cuid().optional(),
    taskId: z.string().cuid().optional(),
    action: z.string().optional(),
    entityType: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const activityParamsSchema = z.object({
  params: z.object({
    projectId: z.string().cuid('Invalid project ID'),
  }),
});

export type ListActivityQuery = z.infer<typeof listActivitySchema>['query'];
export type ActivityParams = z.infer<typeof activityParamsSchema>['params'];