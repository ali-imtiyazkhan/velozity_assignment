'use client';

import { ProtectedRoute } from '@/components/auth';
import { Layout } from '@/components/layout';
import UsersPage from '@/pageComponents/Users';

export default function UsersRoute() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Layout>
        <UsersPage />
      </Layout>
    </ProtectedRoute>
  );
}