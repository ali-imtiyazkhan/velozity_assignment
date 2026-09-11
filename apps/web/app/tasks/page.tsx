'use client';

import { ProtectedRoute } from '@/components/auth';
import { Layout } from '@/components/layout';
import { TasksPage } from '@/pages/Tasks';

export default function TasksRoute() {
  return (
    <ProtectedRoute>
      <Layout>
        <TasksPage />
      </Layout>
    </ProtectedRoute>
  );
}