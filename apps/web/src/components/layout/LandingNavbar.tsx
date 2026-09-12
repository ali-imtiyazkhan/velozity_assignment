'use client';

import { ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';

const ORANGE = '#ef4d23';

const NAV_LINKS = ['Features', 'Pricing', 'About'] as const;

type NavLink = (typeof NAV_LINKS)[number];

function NavLabel({ link }: { link: NavLink }) {
  return (
    <span className="font-medium text-gray-900 dark:text-white transition-colors hover:text-gray-500 dark:hover:text-gray-400">
      {link}
    </span>
  );
}

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex justify-center px-3 pt-4 sm:px-4 sm:pt-6">
      <nav className="relative flex w-full max-w-[760px] mx-auto items-center rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 py-2 pl-2 pr-2 shadow-sm backdrop-blur-sm">
        <Link
          href="/"
          className="shrink-0 pl-1.5"
          aria-label="Velozity home"
        >
          <Logo className="h-7 w-7 sm:h-8 sm:w-8" />
        </Link>

        <div className="hidden items-center gap-6 pl-5 text-[14px] md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link}
              href={`#${link.toLowerCase()}`}
              className="inline-flex items-center gap-1.5 font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
            >
              <NavLabel link={link} />
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link href="/login">
            <button
              type="button"
              className="hidden p-2 text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white md:inline-flex"
              aria-label="Sign in"
            >
              Sign in
            </button>
          </Link>
          <Link href="/auth/register">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#ef4d23] py-1.5 pl-4 pr-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 sm:text-[14px]"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Get Started</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </span>
            </button>
          </Link>
          <button
            type="button"
            className="inline-flex p-2 text-gray-800 dark:text-gray-200 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {open && (
          <div className="absolute left-2 right-2 top-full z-20 mt-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-lg md:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link}
                href={`#${link.toLowerCase()}`}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[14px] font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setOpen(false)}
              >
                <NavLabel link={link} />
              </Link>
            ))}
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[14px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[14px] font-medium text-[#ef4d23] hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}