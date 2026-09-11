'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { ActivityLog, PaginatedResponse } from '@/types';

export const activityKeys = {
  all: ['activity'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...activityKeys.lists(), filters] as const,
};

export function useActivity(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: activityKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get<PaginatedResponse<ActivityLog>>(
        `${ENDPOINTS.activity.list}?${params.toString()}`
      );
      return response.data;
    },
  });
}