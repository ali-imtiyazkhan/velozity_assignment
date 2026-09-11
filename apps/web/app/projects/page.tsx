'use client';

import { ProtectedRoute } from '@/components/auth';
import { Layout } from '@/components/layout';
import { ProjectsPage } from '@/pages/Projects';

export default function ProjectsRoute() {
  return (
    <ProtectedRoute>
      <Layout>
        <ProjectsPage />
      </Layout>
    </ProtectedRoute>
  );
}