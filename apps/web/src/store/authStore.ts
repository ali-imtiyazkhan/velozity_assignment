'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

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
      
      login: (accessToken, user) => 
        set({ accessToken, user, isAuthenticated: true }),
      
      logout: () => 
        set({ accessToken: null, user: null, isAuthenticated: false }),
      
      setUser: (user) => 
        set({ user }),
      
      setAuthenticated: (isAuthenticated, user) => 
        set({ isAuthenticated, user: user ?? null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);