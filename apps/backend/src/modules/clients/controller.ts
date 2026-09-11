import type { Request, Response } from 'express';
import { createClient, getClientById, updateClient, deleteClient, listClients } from './service';
import type { CreateClientInput, UpdateClientInput, GetClientParams, ListClientsQuery } from './schemas';

export async function createClientController(req: Request, res: Response) {
  const data = req.body as CreateClientInput;
  const client = await createClient(data);

  res.status(201).json({
    success: true,
    data: { client },
  });
}

export async function getClientController(req: Request, res: Response) {
  const { id } = req.params as GetClientParams;
  const client = await getClientById(id);

  res.json({
    success: true,
    data: { client },
  });
}

export async function updateClientController(req: Request, res: Response) {
  const { id } = req.params as GetClientParams;
  const data = req.body as UpdateClientInput;
  const client = await updateClient(id, data);

  res.json({
    success: true,
    data: { client },
  });
}

export async function deleteClientController(req: Request, res: Response) {
  const { id } = req.params as GetClientParams;
  await deleteClient(id);

  res.json({
    success: true,
    data: { message: 'Client deleted successfully' },
  });
}

export async function listClientsController(req: Request, res: Response) {
  const query = req.query as unknown as ListClientsQuery;
  const result = await listClients(query);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}