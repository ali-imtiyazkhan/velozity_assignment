'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useMe } from '@/api/hooks';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: ReturnType<typeof useAuthStore>['user'];
  isAuthenticated: ReturnType<typeof useAuthStore>['isAuthenticated'];
  login: ReturnType<typeof useAuthStore>['login'];
  logout: ReturnType<typeof useAuthStore>['logout'];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, login, logout, setAuthenticated } = useAuthStore();
  const { data: meData, isLoading, isError } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isError && meData) {
      setAuthenticated(true, meData.user);
    } else if (!isLoading && (isError || !meData)) {
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