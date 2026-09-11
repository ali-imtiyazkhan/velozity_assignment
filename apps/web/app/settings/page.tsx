'use client';

import { ProtectedRoute } from '@/components/auth';
import { Layout } from '@/components/layout';
import { SettingsPage } from '@/pages/Settings';

export default function SettingsRoute() {
  return (
    <ProtectedRoute>
      <Layout>
        <SettingsPage />
      </Layout>
    </ProtectedRoute>
  );
}