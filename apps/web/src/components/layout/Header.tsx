'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Avatar } from '@/components/ui';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export function Header() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const userMenuItems: DropdownItem[] = [
    {
      label: 'Profile',
      onClick: () => console.log('Profile clicked'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: 'Settings',
      onClick: () => console.log('Settings clicked'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    { label: 'Logout', onClick: logout, danger: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            Velozity
          </Link>
          
          {/* Authenticated navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/projects" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/tasks" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Tasks
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/users" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Users
                </Link>
              )}
              {user.role !== 'DEVELOPER' && (
                <Link href="/clients" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Clients
                </Link>
              )}
              <Link href="/activity" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Activity
              </Link>
            </nav>
          )}

          {/* Unauthenticated navigation */}
          {!user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                About
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user && <NotificationBell />}

          {user ? (
            <Dropdown trigger={<button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="User menu">
              <Avatar 
                name={user?.name || 'User'} 
                src={user?.avatarUrl} 
                size="sm" 
              />
            </button>}
              items={userMenuItems}
              align="right"
            />
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}