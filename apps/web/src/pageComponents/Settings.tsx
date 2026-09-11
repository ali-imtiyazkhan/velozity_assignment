'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Badge, Avatar } from '@/components/ui';
import { formatDate, getRoleColor } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    updateProfile(formData, {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to update profile';
        setErrors({ submit: message });
      },
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
                Profile updated successfully!
              </div>
            )}
            {errors.submit && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                {errors.submit}
              </div>
            )}

            <div className="flex items-center gap-4">
              <Avatar name={user?.name} size="xl" src={user?.avatarUrl} />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                <Badge className={cn('mt-2', getRoleColor(user?.role || ''))}>{user?.role}</Badge>
              </div>
            </div>

            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="Enter your name"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="Enter your email"
            />

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Account Info</h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">User ID</dt>
                  <dd className="font-mono text-gray-900 dark:text-white">{user?.id}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Role</dt>
                  <dd className="font-medium text-gray-900 dark:text-white capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Member since</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{formatDate(user?.createdAt || '')}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Last updated</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{formatDate(user?.updatedAt || '')}</dd>
                </div>
              </dl>
            </div>

            <Button type="submit" loading={isPending} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Delete Account</h4>
            <p className="text-red-700 dark:text-red-300 text-sm mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="danger">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}