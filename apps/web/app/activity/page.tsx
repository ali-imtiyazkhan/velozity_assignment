'use client';

import { ProtectedRoute } from '@/components/auth';
import { Layout } from '@/components/layout';
import { ActivityPage } from '@/pages/Activity';

export default function ActivityRoute() {
  return (
    <ProtectedRoute>
      <Layout>
        <ActivityPage />
      </Layout>
    </ProtectedRoute>
  );
}