'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { PaginatedResponse } from '@/types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  admin: () => [...dashboardKeys.all, 'admin'] as const,
  pm: () => [...dashboardKeys.all, 'pm'] as const,
  developer: () => [...dashboardKeys.all, 'developer'] as const,
};

export interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    overdueTasks: number;
    onlineUsers: number;
  };
  recentActivity: any[];
  overdueTasksList: any[];
}

export interface PMDashboardData {
  stats: {
    myProjects: number;
    totalTasks: number;
    tasksInReview: number;
    overdueTasks: number;
  };
  projects: any[];
  priorityBreakdown: Record<string, number>;
  upcomingDueDates: any[];
}

export interface DeveloperDashboardData {
  stats: {
    assignedTasks: number;
    inProgress: number;
    inReview: number;
    done: number;
    overdue: number;
  };
  assignedTasks: any[];
  upcomingDueDates: any[];
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.admin(),
    queryFn: async () => {
      const response = await api.get<AdminDashboardData>(ENDPOINTS.dashboard.admin);
      return response.data;
    },
  });
}

export function usePMDashboard() {
  return useQuery({
    queryKey: dashboardKeys.pm(),
    queryFn: async () => {
      const response = await api.get<PMDashboardData>(ENDPOINTS.dashboard.pm);
      return response.data;
    },
  });
}

export function useDeveloperDashboard() {
  return useQuery({
    queryKey: dashboardKeys.developer(),
    queryFn: async () => {
      const response = await api.get<DeveloperDashboardData>(ENDPOINTS.dashboard.developer);
      return response.data;
    },
  });
}