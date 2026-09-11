import { Suspense } from 'react';
import LoginPage from '@/pageComponents/Login';

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>}>
      <LoginPage />
    </Suspense>
  );
}