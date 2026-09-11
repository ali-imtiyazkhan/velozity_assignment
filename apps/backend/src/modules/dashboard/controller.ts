import type { Request, Response } from 'express';
import { getDashboardStats } from './service';
import type { DashboardQuery } from './schemas';

export async function getDashboardController(req: Request, res: Response) {
  const query = req.query as unknown as DashboardQuery;
  const stats = await getDashboardStats(req.user!.userId, req.user!.role as any, query);

  res.json({
    success: true,
    data: stats,
  });
}