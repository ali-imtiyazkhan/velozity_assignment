'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { setAccessToken } from '@/api/client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean, user?: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: (accessToken, user) => {
        setAccessToken(accessToken);
        set({ accessToken, user, isAuthenticated: true });
      },

      logout: () => {
        setAccessToken(null);
        set({ accessToken: null, user: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),

      setAuthenticated: (isAuthenticated, user) =>
        set((state) => ({
          isAuthenticated,
          user: user !== undefined ? user : state.user,
        })),
    }),
    {
      name: 'velozity-auth-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAccessToken(state.accessToken);
        }
      },
    }
  )
);