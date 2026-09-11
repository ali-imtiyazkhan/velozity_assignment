'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Notification, PaginatedResponse } from '@/types';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function useNotifications(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: notificationKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get<PaginatedResponse<Notification>>(
        `${ENDPOINTS.notifications.list}?${params.toString()}`
      );
      return response.data;
    },
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await api.get<{ count: number }>(ENDPOINTS.notifications.unreadCount);
      return response.data.count;
    },
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(ENDPOINTS.notifications.markRead(id));
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        notificationKeys.lists(),
        (old: PaginatedResponse<Notification> | undefined) =>
          old
            ? {
                ...old,
                data: old.data.map((n) =>
                  n.id === id ? { ...n, readAt: new Date().toISOString() } : n
                ),
              }
            : old
      );
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(ENDPOINTS.notifications.markAllRead);
    },
    onSuccess: () => {
      queryClient.setQueryData(
        notificationKeys.lists(),
        (old: PaginatedResponse<Notification> | undefined) =>
          old
            ? {
                ...old,
                data: old.data.map((n) => ({ ...n, readAt: new Date().toISOString() })),
              }
            : old
      );
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}