'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/api/hooks';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const { mutate: loginMutation, isPending } = useLogin();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    loginMutation(
      { email, password },
      {
        onSuccess: (data) => {
          login(data.accessToken, data.user);
          toast.success('Welcome back!');
          router.push(callbackUrl);
          router.refresh();
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || 'Login failed. Please try again.';
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Velozity account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isPending}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isPending}
            />
            <Button type="submit" className="w-full" loading={isPending}>
              Sign in
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Demo accounts:</p>
            <div className="mt-2 space-y-1 text-left">
              <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">admin@velozity.com / password123</p>
              <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">pm1@velozity.com / password123</p>
              <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">dev1@velozity.com / password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}