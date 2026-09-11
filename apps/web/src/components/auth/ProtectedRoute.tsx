'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMe } from '@/api/hooks';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER')[];
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, setAuthenticated } = useAuthStore();
  const { data: meData, isLoading, isError } = useMe();

  useEffect(() => {
    if (!isLoading && !isError && meData) {
      setAuthenticated(true, meData.user);
    } else if (!isLoading && (isError || !meData)) {
      setAuthenticated(false);
    }
  }, [isLoading, isError, meData, setAuthenticated]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`${fallbackPath}?callbackUrl=${encodeURIComponent(pathname)}`);
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname, fallbackPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}