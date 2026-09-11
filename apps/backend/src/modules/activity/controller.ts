import type { Request, Response } from 'express';
import { listActivityLogs, getProjectActivity, getRecentActivity } from './service';
import type { ListActivityQuery, ActivityParams } from './schemas';

export async function listActivityController(req: Request, res: Response) {
  const query = req.query as unknown as ListActivityQuery;
  const result = await listActivityLogs(query, req.user!.userId, req.user!.role as any);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}

export async function getProjectActivityController(req: Request, res: Response) {
  const { projectId } = req.params as ActivityParams;
  const query = req.query as unknown as ListActivityQuery;
  const result = await getProjectActivity(projectId, query, req.user!.userId, req.user!.role as any);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}

export async function getRecentActivityController(req: Request, res: Response) {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
  const logs = await getRecentActivity(req.user!.userId, req.user!.role as any, limit);

  res.json({
    success: true,
    data: logs,
  });
}