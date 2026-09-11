import { z } from 'zod';

export const listNotificationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    read: z.coerce.boolean().optional(),
    type: z.string().optional(),
  }),
});

export const markReadSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid notification ID'),
  }),
});

export const markAllReadSchema = z.object({
  body: z.object({
    notificationIds: z.array(z.string().cuid()).optional(),
  }),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsSchema>['query'];
export type MarkReadParams = z.infer<typeof markReadSchema>['params'];
export type MarkAllReadInput = z.infer<typeof markAllReadSchema>['body'];