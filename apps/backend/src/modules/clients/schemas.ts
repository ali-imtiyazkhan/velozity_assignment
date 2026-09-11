import { z } from 'zod';

export const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().email('Invalid email format'),
    company: z.string().max(255).optional().nullable(),
  }),
});

export const updateClientSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid client ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255).optional(),
    email: z.string().email('Invalid email format').optional(),
    company: z.string().max(255).optional().nullable(),
  }),
});

export const getClientSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid client ID'),
  }),
});

export const listClientsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
  }),
});

export type CreateClientInput = z.infer<typeof createClientSchema>['body'];
export type UpdateClientInput = z.infer<typeof updateClientSchema>['body'];
export type GetClientParams = z.infer<typeof getClientSchema>['params'];
export type ListClientsQuery = z.infer<typeof listClientsSchema>['query'];