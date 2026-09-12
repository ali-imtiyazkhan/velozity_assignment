'use client';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { Layout } from '@/components/layout/Layout';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <Layout showFooter={false}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </Layout>
  );
}