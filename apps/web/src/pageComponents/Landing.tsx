'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import DashboardPreview from '@/components/dashboard/DashboardPreview';

const VIDEO_SRC = '/assets/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4';
const POSTER_SRC = '/assets/unsplash-photo-1557683316-973673baf926.jpg';

const legacyPlaysInlineAttrs = {
  'webkit-playsinline': 'true',
  'x5-playsinline': 'true',
};

export default function LandingPage() {
  return (
    <main
      className="min-h-screen w-full bg-[#ededed] dark:bg-gray-950 p-3 sm:p-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <section className="relative h-[calc(100vh-24px)] w-full overflow-hidden rounded-2xl bg-[#d9d9d9] dark:bg-gray-900 sm:h-[calc(100vh-32px)] sm:rounded-3xl">
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50 dark:opacity-30"
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disableRemotePlayback
          {...legacyPlaysInlineAttrs}
        />
        <div className="absolute inset-0 bg-white/10 dark:bg-black/20" aria-hidden="true" />

        <div className="relative z-10">
          <LandingNavbar />

          <div className="flex flex-col items-center px-4 pb-8 pt-10 text-center sm:pb-12 sm:pt-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-gray-800/80 px-4 py-1.5 text-[13px] shadow-sm backdrop-blur-sm">
              <span
                className="h-2 w-2 rounded-full bg-[#ef4d23]"
                aria-hidden="true"
              />
              Velozity
            </span>

            <h1
              className="mt-5 max-w-4xl text-gray-900 dark:text-white sm:mt-6"
              style={{
                fontSize: 'clamp(36px, 8vw, 72px)',
                lineHeight: 1.05,
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              Project Management
              <br />
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                Built for Teams
              </span>
            </h1>

            <p
              className="mt-4 px-2 text-gray-700 dark:text-gray-300 sm:mt-6"
              style={{ fontSize: 'clamp(13px, 3.5vw, 16px)' }}
            >
              Plan, track, and deliver projects with confidence. Velozity combines real-time collaboration, role-based access control, and intelligent automation in one powerful platform.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center gap-3 rounded-full bg-[#0b0f1a] dark:bg-white py-2 pl-6 pr-2 text-[14px] font-medium text-white dark:text-[#0b0f1a] sm:py-2.5 sm:pl-7 transition-opacity hover:opacity-90"
                >
                  Start Free Trial
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 dark:bg-gray-900/15 sm:h-7 sm:w-7">
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </span>
                </button>
              </Link>
              <Link href="#features">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center gap-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent py-2 pl-6 pr-2 text-[14px] font-medium text-gray-900 dark:text-white sm:py-2.5 sm:pl-7 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  View Demo
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 sm:h-7 sm:w-7">
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </span>
                </button>
              </Link>
            </div>
          </div>

          <DashboardPreview />
        </div>
      </section>
    </main>
  );
}