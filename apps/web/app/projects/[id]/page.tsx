'use client';

import { ProtectedRoute } from '@/components/auth';
import { Layout } from '@/components/layout';
import ProjectDetailPage from '@/pageComponents/ProjectDetail';

export default function ProjectDetailRoute() {
  return (
    <ProtectedRoute>
      <Layout>
        <ProjectDetailPage />
      </Layout>
    </ProtectedRoute>
  );
}