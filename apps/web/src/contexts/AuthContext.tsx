'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useMe } from '@/api/hooks';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, login, logout, setAuthenticated } = useAuthStore();
  const { data: meData, isLoading, isError } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isError && meData) {
      const currentUser = (meData as any)?.user || (meData as any)?.data?.user || meData;
      setAuthenticated(true, currentUser);
    } else if (!isLoading && isError) {
      setAuthenticated(false);
    }
  }, [isLoading, isError, meData, setAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}