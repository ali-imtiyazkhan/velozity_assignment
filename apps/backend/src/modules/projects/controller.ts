import type { Request, Response } from 'express';
import {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  listProjects,
  getProjectStats,
} from './service';
import type { CreateProjectInput, UpdateProjectInput, GetProjectParams, ListProjectsQuery, ProjectParams } from './schemas';

export async function createProjectController(req: Request, res: Response) {
  const data = req.body as CreateProjectInput;
  const project = await createProject(data, req.user!.userId, req.user!.role as any);

  res.status(201).json({
    success: true,
    data: { project },
  });
}

export async function getProjectController(req: Request, res: Response) {
  const { id } = req.params as GetProjectParams;
  const project = await getProjectById(id);

  res.json({
    success: true,
    data: { project },
  });
}

export async function updateProjectController(req: Request, res: Response) {
  const { id } = req.params as GetProjectParams;
  const data = req.body as UpdateProjectInput;
  const project = await updateProject(id, data, req.user!.userId, req.user!.role as any);

  res.json({
    success: true,
    data: { project },
  });
}

export async function deleteProjectController(req: Request, res: Response) {
  const { id } = req.params as GetProjectParams;
  await deleteProject(id, req.user!.userId, req.user!.role as any);

  res.json({
    success: true,
    data: { message: 'Project deleted successfully' },
  });
}

export async function listProjectsController(req: Request, res: Response) {
  const query = req.query as unknown as ListProjectsQuery;
  const result = await listProjects(query, req.user!.userId, req.user!.role as any);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
}

export async function getProjectStatsController(req: Request, res: Response) {
  const { projectId } = req.params as ProjectParams;
  const stats = await getProjectStats(projectId, req.user!.userId, req.user!.role as any);

  res.json({
    success: true,
    data: stats,
  });
}