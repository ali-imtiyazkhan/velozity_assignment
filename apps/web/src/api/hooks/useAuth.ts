'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { LoginInput, RegisterInput, AuthResponse, User } from '@/types';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await api.get<AuthResponse>(ENDPOINTS.auth.me);
      return response.data;
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const response = await api.post<AuthResponse>(ENDPOINTS.auth.login, input);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const response = await api.post<AuthResponse>(ENDPOINTS.auth.register, input);
      return response.data;
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(ENDPOINTS.auth.logout);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await api.patch<User>(ENDPOINTS.users.update('me'), data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), (old: AuthResponse | undefined) =>
        old ? { ...old, user: data } : undefined
      );
    },
  });
}