'use client';

import { ProtectedRoute } from '@/components/auth';
import { Layout } from '@/components/layout';
import { ClientsPage } from '@/pages/Clients';

export default function ClientsRoute() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']}>
      <Layout>
        <ClientsPage />
      </Layout>
    </ProtectedRoute>
  );
}