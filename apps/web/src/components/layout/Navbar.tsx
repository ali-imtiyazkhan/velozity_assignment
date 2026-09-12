'use client';

import { ChevronDown, ChevronRight, Menu, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Logo } from './Logo';
import { Button } from './Button';
import { Dropdown, DropdownItem } from './Dropdown';

const ORANGE = '#ef4d23';

const NAV_LINKS = ['Features', 'Pricing', 'About'] as const;
const AUTH_LINKS = ['Dashboard', 'Projects', 'Tasks', 'Clients', 'Activity'] as const;

type NavLink = (typeof NAV_LINKS)[number];
type AuthLink = (typeof AUTH_LINKS)[number];

function NavLabel({ link, isActive }: { link: NavLink; isActive?: boolean }) {
  return (
    <span className="font-medium text-gray-900 dark:text-white transition-colors hover:text-gray-500 dark:hover:text-gray-400">
      {link}
    </span>
  );
}

function AuthNavLabel({ link, isActive }: { link: AuthLink; isActive?: boolean }) {
  return (
    <span className="font-medium text-gray-900 dark:text-white transition-colors hover:text-gray-500 dark:hover:text-gray-400">
      {link}
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav className="relative flex w-full max-w-[760px] mx-auto items-center rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 py-2 pl-2 pr-2 shadow-sm px-3 pt-4 sm:px-4 sm:pt-6">
        <Link
          href="/"
          className="shrink-0 pl-1.5"
          aria-label="Velozity home"
        >
          <Logo className="h-7 w-7 sm:h-8 sm:w-8" />
        </Link>

        <div className="hidden items-center gap-6 pl-5 text-[14px] md:flex">
          {!user ? (
            NAV_LINKS.map((link) => (
              <Link
                key={link}
                href={`#${link.toLowerCase()}`}
                className="inline-flex items-center gap-1.5 font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
              >
                <NavLabel link={link} />
              </Link>
            ))
          ) : (
            AUTH_LINKS.map((link) => (
              <Link
                key={link}
                href={`/${link.toLowerCase()}`}
                className="inline-flex items-center gap-1.5 font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
              >
                <AuthNavLabel link={link} />
              </Link>
            ))
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {!user && (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="inline-flex items-center gap-2 rounded-full bg-[#ef4d23] py-1.5 pl-4 pr-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 sm:text-[14px]">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Get Started</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </span>
                </Button>
              </Link>
            </>
          )}

          {user && (
            <Dropdown
              trigger={
                <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="User menu">
                  <Logo size="sm" />
                </button>
              }
              items={userMenuItems}
              align="right"
            />
          )}

          <button
            type="button"
            className="inline-flex p-2 text-gray-800 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {open && (
          <div className="absolute left-2 right-2 top-full z-20 mt-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-lg md:hidden">
            {!user ? (
              NAV_LINKS.map((link) => (
                <Link
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[14px] font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setOpen(false)}
                >
                  <NavLabel link={link} />
                </Link>
              ))
            ) : (
              AUTH_LINKS.map((link) => (
                <Link
                  key={link}
                  href={`/${link.toLowerCase()}`}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[14px] font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setOpen(false)}
                >
                  <AuthNavLabel link={link} />
                </Link>
              ))
            )}
            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[14px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}