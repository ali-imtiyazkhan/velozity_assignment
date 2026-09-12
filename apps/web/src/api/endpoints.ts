export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  users: {
    list: '/users',
    create: '/users',
    get: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  clients: {
    list: '/clients',
    create: '/clients',
    get: (id: string) => `/clients/${id}`,
    update: (id: string) => `/clients/${id}`,
    delete: (id: string) => `/clients/${id}`,
  },
  projects: {
    list: '/projects',
    create: '/projects',
    get: (id: string) => `/projects/${id}`,
    update: (id: string) => `/projects/${id}`,
    delete: (id: string) => `/projects/${id}`,
    tasks: (id: string) => `/projects/${id}/tasks`,
    activity: (id: string) => `/projects/${id}/activity`,
  },
  tasks: {
    list: '/tasks',
    create: '/tasks',
    get: (id: string) => `/tasks/${id}`,
    update: (id: string) => `/tasks/${id}`,
    delete: (id: string) => `/tasks/${id}`,
    updateStatus: (id: string) => `/tasks/${id}/status`,
  },
  activity: {
    list: '/activity',
    get: (id: string) => `/activity/${id}`,
  },
  notifications: {
    list: '/notifications',
    get: (id: string) => `/notifications/${id}`,
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    unreadCount: '/notifications/unread-count',
  },
  dashboard: {
    admin: '/dashboard/admin',
    pm: '/dashboard/pm',
    developer: '/dashboard/developer',
  },
} as const;