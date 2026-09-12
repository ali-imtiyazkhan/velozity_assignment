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
  const { data: adminData, isLoading: adminLoading } = useAdminDashboard();
  const { data: pmData, isLoading: pmLoading } = usePMDashboard();
  const { data: devData, isLoading: devLoading } = useDeveloperDashboard();

  const isLoading = adminLoading || pmLoading || devLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (user?.role === 'ADMIN' && adminData) {
    return <AdminDashboard data={adminData} />;
  }

  if (user?.role === 'PROJECT_MANAGER' && pmData) {
    return <PMDashboard data={pmData} />;
  }

  if (user?.role === 'DEVELOPER' && devData) {
    return <DeveloperDashboard data={devData} />;
  }

  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Velozity</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">Your dashboard will appear here</p>
    </div>
  );
}