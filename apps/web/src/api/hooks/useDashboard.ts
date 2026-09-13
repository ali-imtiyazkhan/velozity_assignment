'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  admin: () => [...dashboardKeys.all, 'admin'] as const,
  pm: () => [...dashboardKeys.all, 'pm'] as const,
  developer: () => [...dashboardKeys.all, 'developer'] as const,
};

export interface AdminDashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  overdueTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  usersByRole: Record<string, number>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    projectId: string;
    createdAt: string;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }>;
  onlineUsers: number;
}

export interface PMDashboardStats {
  myProjects: number;
  totalTasks: number;
  overdueTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    project: { id: string; name: string };
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    projectId: string;
    createdAt: string;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }>;
}

export interface DeveloperDashboardStats {
  assignedTasks: number;
  overdueTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    status: string;
    project: { id: string; name: string };
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    projectId: string;
    createdAt: string;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }>;
}

export function useAdminDashboard(enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.admin(),
    queryFn: async () => {
      const response = await api.get<any>(ENDPOINTS.dashboard.admin);
      return response.data?.data || response.data;
    },
    enabled,
    retry: (failureCount, error: any) => {
      if (error.response?.status === 403 || error.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

export function usePMDashboard(enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.pm(),
    queryFn: async () => {
      const response = await api.get<any>(ENDPOINTS.dashboard.pm);
      return response.data?.data || response.data;
    },
    enabled,
    retry: (failureCount, error: any) => {
      if (error.response?.status === 403 || error.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

export function useDeveloperDashboard(enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.developer(),
    queryFn: async () => {
      const response = await api.get<any>(ENDPOINTS.dashboard.developer);
      return response.data?.data || response.data;
    },
    enabled,
    retry: (failureCount, error: any) => {
      if (error.response?.status === 403 || error.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}