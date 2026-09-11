'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import { ENDPOINTS } from '../endpoints';
import type { Project, CreateProjectInput, UpdateProjectInput, PaginatedResponse } from '@/types';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  tasks: (id: string) => [...projectKeys.detail(id), 'tasks'] as const,
  activity: (id: string) => [...projectKeys.detail(id), 'activity'] as const,
};

export function useProjects(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: projectKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get<PaginatedResponse<Project>>(
        `${ENDPOINTS.projects.list}?${params.toString()}`
      );
      return response.data;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<Project>(ENDPOINTS.projects.get(id));
      return response.data;
    },
    enabled: !!id,
  });
}

export function useProjectTasks(projectId: string, filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...projectKeys.tasks(projectId), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get<PaginatedResponse<any>>(
        `${ENDPOINTS.projects.tasks(projectId)}?${params.toString()}`
      );
      return response.data;
    },
    enabled: !!projectId,
  });
}

export function useProjectActivity(projectId: string, filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...projectKeys.activity(projectId), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get<any[]>(
        `${ENDPOINTS.projects.activity(projectId)}?${params.toString()}`
      );
      return response.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const response = await api.post<Project>(ENDPOINTS.projects.create, input);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectInput }) => {
      const response = await api.patch<Project>(ENDPOINTS.projects.update(id), data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(projectKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(ENDPOINTS.projects.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}