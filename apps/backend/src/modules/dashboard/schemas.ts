import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  query: z.object({
    projectId: z.string().cuid().optional(),
  }),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>['query'];