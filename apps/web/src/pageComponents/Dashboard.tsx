'use client';

import { useAuthStore } from '@/store/authStore';
import { useAdminDashboard, usePMDashboard, useDeveloperDashboard } from '@/api/hooks';
import { AdminDashboard, PMDashboard, DeveloperDashboard } from '@/components/dashboard';
import { Suspense } from 'react';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';
  const isPM = user?.role === 'PROJECT_MANAGER';
  const isDeveloper = user?.role === 'DEVELOPER';

  const { data: adminData, isLoading: adminLoading, isError: adminError } = useAdminDashboard(isAdmin);
  const { data: pmData, isLoading: pmLoading, isError: pmError } = usePMDashboard(isPM);
  const { data: devData, isLoading: devLoading, isError: devError } = useDeveloperDashboard(isDeveloper);

  // Only wait for the relevant dashboard based on user role
  const isLoading = 
    (user?.role === 'ADMIN' && adminLoading) ||
    (user?.role === 'PROJECT_MANAGER' && pmLoading) ||
    (user?.role === 'DEVELOPER' && devLoading);

  const hasError = 
    (user?.role === 'ADMIN' && adminError) ||
    (user?.role === 'PROJECT_MANAGER' && pmError) ||
    (user?.role === 'DEVELOPER' && devError);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Failed to load dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  if (user?.role === 'ADMIN' && adminData) {
    return <AdminDashboard data={(adminData as any)?.data || adminData} />;
  }

  if (user?.role === 'PROJECT_MANAGER' && pmData) {
    return <PMDashboard data={(pmData as any)?.data || pmData} />;
  }

  if (user?.role === 'DEVELOPER' && devData) {
    return <DeveloperDashboard data={(devData as any)?.data || devData} />;
  }

  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Velozity</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">Your dashboard will appear here</p>
    </div>
  );
}