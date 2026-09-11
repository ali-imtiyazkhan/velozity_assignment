export const JWT_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET!,
} as const;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  DEVELOPER: 'DEVELOPER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_IN_REVIEW: 'TASK_IN_REVIEW',
  TASK_OVERDUE: 'TASK_OVERDUE',
  STATUS_CHANGED: 'STATUS_CHANGED',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const ACTIVITY_ACTIONS = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  ASSIGNED: 'ASSIGNED',
  UNASSIGNED: 'UNASSIGNED',
  DELETED: 'DELETED',
} as const;

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS];

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_PROJECT: 'join:project',
  LEAVE_PROJECT: 'leave:project',
  TASK_STATUS_UPDATE: 'task:status-update',
  ACTIVITY_NEW: 'activity:new',
  ACTIVITY_CATCHUP: 'activity:catchup',
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',
} as const;

export const ROOMS = {
  PROJECT: (projectId: string) => `project:${projectId}`,
  USER: (userId: string) => `user:${userId}`,
  ADMIN: 'role:admin',
  PM: (managerId: string) => `role:pm:${managerId}`,
  DEVELOPER: (userId: string) => `role:developer:${userId}`,
  PRESENCE: 'presence',
} as const;