'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import DashboardPreview from '@/components/dashboard/DashboardPreview';

const VIDEO_SRC = '/assets/demo.mp4';
const POSTER_SRC = '/assets/poster.jpg';

const legacyPlaysInlineAttrs = {
  'webkit-playsinline': 'true',
  'x5-playsinline': 'true',
};

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '< 50ms', label: 'API Latency' },
  { value: '10K+', label: 'Concurrent Users' },
  { value: 'SOC 2', label: 'Compliance' },
];

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Real-time Collaboration',
    description: 'Work together seamlessly with live updates, presence indicators, and instant notifications across your team.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Role-Based Access Control',
    description: 'Granular permissions for Admins, Project Managers, and Developers with project-level isolation.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Smart Automation',
    description: 'Automated overdue detection, status transitions, and background job processing with Bull queues.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Insightful Dashboards',
    description: 'Role-specific dashboards with task analytics, priority breakdowns, and upcoming deadlines.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Authentication',
    description: 'JWT with refresh token rotation, HttpOnly cookies, and CSRF protection built-in.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'Activity Tracking',
    description: 'Complete audit trail with role-filtered activity feeds and missed event catch-up on reconnect.',
  },
];

const roles = [
  {
    role: 'Administrator',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    features: [
      'Full system access & user management',
      'Global activity feed & analytics',
      'System-wide configuration',
      'Audit logs & compliance reports',
    ],
  },
  {
    role: 'Project Manager',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012 2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    features: [
      'Create & manage projects',
      'Assign tasks to developers',
      'Review & approve work',
      'Project dashboards & deadlines',
    ],
  },
  {
    role: 'Developer',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    features: [
      'Personal task queue & Kanban',
      'Real-time status updates',
      'Code review workflow',
      'Personal dashboard & notifications',
    ],
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-[#ededed] dark:bg-gray-950 p-3 sm:p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
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
          <Navbar />

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

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Powerful features designed for modern development teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-shadow duration-300 h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="relative max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to transform your workflow?
              </h2>
              <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
                Join thousands of teams using Velozity to deliver projects on time, every time.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/register">
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-primary-700 font-medium text-lg hover:bg-primary-50 transition-colors"
                  >
                    Start Free Trial
                  </button>
                </Link>
                <Link href="#features">
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-white text-white font-medium text-lg hover:bg-white/10 transition-colors"
                  >
                    See How It Works
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-based Features */}
      <section id="roles" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built for every role
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Tailored experiences for your entire organization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role) => (
              <div key={role.role} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-full">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
                  {role.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {role.role}
                </h3>
                <ul className="space-y-3">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}