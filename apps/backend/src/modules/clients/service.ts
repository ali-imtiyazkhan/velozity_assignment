import prisma from 'db';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';
import type { CreateClientInput, UpdateClientInput, ListClientsQuery } from './schemas';

export interface ClientResponse {
  id: string;
  name: string;
  email: string;
  company: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function createClient(data: CreateClientInput): Promise<ClientResponse> {
  const existingClient = await prisma.client.findUnique({
    where: { email: data.email },
  });

  if (existingClient) {
    throw new ConflictError('Client with this email already exists');
  }

  const client = await prisma.client.create({
    data: {
      name: data.name,
      email: data.email,
      company: data.company,
    },
  });

  return client;
}

export async function getClientById(id: string): Promise<ClientResponse> {
  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    throw new NotFoundError('Client not found');
  }

  return client;
}

export async function updateClient(id: string, data: UpdateClientInput): Promise<ClientResponse> {
  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    throw new NotFoundError('Client not found');
  }

  if (data.email && data.email !== client.email) {
    const existingClient = await prisma.client.findUnique({
      where: { email: data.email },
    });

    if (existingClient) {
      throw new ConflictError('Client with this email already exists');
    }
  }

  const updatedClient = await prisma.client.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      company: data.company ?? undefined,
    },
  });

  return updatedClient;
}

export async function deleteClient(id: string): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client) {
    throw new NotFoundError('Client not found');
  }

  await prisma.client.delete({
    where: { id },
  });
}

export async function listClients(query: ListClientsQuery) {
  const { page, limit, search } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    data: clients,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}