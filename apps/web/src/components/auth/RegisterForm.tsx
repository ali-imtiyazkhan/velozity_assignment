'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRegister } from '@/api/hooks';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Select } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { setAccessToken } from '@/api/client';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Role } from '@/types/api';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const { mutate: registerMutation, isPending } = useRegister();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: Role.DEVELOPER,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    registerMutation(
      { name: formData.name, email: formData.email, password: formData.password, role: formData.role },
      {
        onSuccess: (data) => {
          setAccessToken(data.accessToken);
          login(data.accessToken, data.user);
          toast.success('Account created successfully!');
          router.push(callbackUrl);
          router.refresh();
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || 'Registration failed. Please try again.';
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-700 p-12 lg:p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-4">Velozity</h1>
          <p className="text-lg text-primary-100 max-w-md">
            Plan, track, and deliver projects with confidence. 
            Real-time collaboration, role-based access, and intelligent automation.
          </p>
        </div>
        <div className="flex items-center gap-6 text-primary-200 text-sm">
          <span>✓ Real-time collaboration</span>
          <span>✓ Role-based access control</span>
          <span>✓ Smart automation</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">Velozity</Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-2">Create your account</h1>
            <p className="text-gray-500 dark:text-gray-400">Start managing projects with your team</p>
          </div>

          <Card className="shadow-xl">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={errors.name}
                  placeholder="John Doe"
                  autoComplete="name"
                  disabled={isPending}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isPending}
                />
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={errors.password}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isPending}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isPending}
                />
                
                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  error={errors.role}
                  disabled={isPending}
                  options={[
                    { value: 'DEVELOPER', label: 'Developer' },
                    { value: 'PROJECT_MANAGER', label: 'Project Manager' },
                    { value: 'ADMIN', label: 'Administrator' },
                  ]}
                  placeholder="Select your role"
                />

                <Button type="submit" className="w-full" loading={isPending} size="lg">
                  Create Account
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}