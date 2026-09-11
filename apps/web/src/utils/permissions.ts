import type { User } from '@/types';

export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export function hasRole(user: User | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.includes(user.role as Role);
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, ['ADMIN']);
}

export function isProjectManager(user: User | null): boolean {
  return hasRole(user, ['PROJECT_MANAGER', 'ADMIN']);
}

export function isDeveloper(user: User | null): boolean {
  return hasRole(user, ['DEVELOPER', 'PROJECT_MANAGER', 'ADMIN']);
}

export function canManageUsers(user: User | null): boolean {
  return isAdmin(user);
}

export function canManageClients(user: User | null): boolean {
  return isProjectManager(user);
}

export function canManageProjects(user: User | null): boolean {
  return isProjectManager(user);
}

export function canCreateProject(user: User | null): boolean {
  return isProjectManager(user);
}

export function canUpdateProject(user: User | null, projectManagerId: string): boolean {
  if (isAdmin(user)) return true;
  if (isProjectManager(user) && user?.id === projectManagerId) return true;
  return false;
}

export function canDeleteProject(user: User | null, projectManagerId: string): boolean {
  if (isAdmin(user)) return true;
  if (isProjectManager(user) && user?.id === projectManagerId) return true;
  return false;
}

export function canViewProject(user: User | null, projectManagerId: string, assigneeId?: string): boolean {
  if (isAdmin(user)) return true;
  if (isProjectManager(user) && user?.id === projectManagerId) return true;
  if (isDeveloper(user) && user?.id === assigneeId) return true;
  return false;
}

export function canManageTasks(user: User | null): boolean {
  return isProjectManager(user);
}

export function canCreateTask(user: User | null): boolean {
  return isProjectManager(user);
}

export function canUpdateTask(user: User | null, projectManagerId: string, assigneeId?: string): boolean {
  if (isAdmin(user)) return true;
  if (isProjectManager(user) && user?.id === projectManagerId) return true;
  if (isDeveloper(user) && user?.id === assigneeId) return true;
  return false;
}

export function canUpdateTaskStatus(user: User | null, projectManagerId: string, assigneeId?: string): boolean {
  if (isAdmin(user)) return true;
  if (isProjectManager(user) && user?.id === projectManagerId) return true;
  if (isDeveloper(user) && user?.id === assigneeId) return true;
  return false;
}

export function canDeleteTask(user: User | null, projectManagerId: string): boolean {
  if (isAdmin(user)) return true;
  if (isProjectManager(user) && user?.id === projectManagerId) return true;
  return false;
}

export function canViewActivity(user: User | null): boolean {
  return !!user;
}

export function canManageNotifications(user: User | null): boolean {
  return !!user;
}

export const PERMISSIONS = {
  USERS: {
    CREATE: 'users:create',
    READ: 'users:read',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
  },
  CLIENTS: {
    CREATE: 'clients:create',
    READ: 'clients:read',
    UPDATE: 'clients:update',
    DELETE: 'clients:delete',
  },
  PROJECTS: {
    CREATE: 'projects:create',
    READ: 'projects:read',
    UPDATE: 'projects:update',
    DELETE: 'projects:delete',
  },
  TASKS: {
    CREATE: 'tasks:create',
    READ: 'tasks:read',
    UPDATE: 'tasks:update',
    DELETE: 'tasks:delete',
    UPDATE_STATUS: 'tasks:update_status',
  },
  ACTIVITY: {
    READ: 'activity:read',
  },
  NOTIFICATIONS: {
    READ: 'notifications:read',
    MARK_READ: 'notifications:mark_read',
  },
} as const;

export type Permission = string;

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: [
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.READ,
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.USERS.DELETE,
    PERMISSIONS.CLIENTS.CREATE,
    PERMISSIONS.CLIENTS.READ,
    PERMISSIONS.CLIENTS.UPDATE,
    PERMISSIONS.CLIENTS.DELETE,
    PERMISSIONS.PROJECTS.CREATE,
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.PROJECTS.UPDATE,
    PERMISSIONS.PROJECTS.DELETE,
    PERMISSIONS.TASKS.CREATE,
    PERMISSIONS.TASKS.READ,
    PERMISSIONS.TASKS.UPDATE,
    PERMISSIONS.TASKS.DELETE,
    PERMISSIONS.TASKS.UPDATE_STATUS,
    PERMISSIONS.ACTIVITY.READ,
    PERMISSIONS.NOTIFICATIONS.READ,
    PERMISSIONS.NOTIFICATIONS.MARK_READ,
  ],
  PROJECT_MANAGER: [
    PERMISSIONS.USERS.READ,
    PERMISSIONS.CLIENTS.CREATE,
    PERMISSIONS.CLIENTS.READ,
    PERMISSIONS.CLIENTS.UPDATE,
    PERMISSIONS.CLIENTS.DELETE,
    PERMISSIONS.PROJECTS.CREATE,
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.PROJECTS.UPDATE,
    PERMISSIONS.PROJECTS.DELETE,
    PERMISSIONS.TASKS.CREATE,
    PERMISSIONS.TASKS.READ,
    PERMISSIONS.TASKS.UPDATE,
    PERMISSIONS.TASKS.DELETE,
    PERMISSIONS.TASKS.UPDATE_STATUS,
    PERMISSIONS.ACTIVITY.READ,
    PERMISSIONS.NOTIFICATIONS.READ,
    PERMISSIONS.NOTIFICATIONS.MARK_READ,
  ],
  DEVELOPER: [
    PERMISSIONS.USERS.READ,
    PERMISSIONS.PROJECTS.READ,
    PERMISSIONS.TASKS.READ,
    PERMISSIONS.TASKS.UPDATE_STATUS,
    PERMISSIONS.ACTIVITY.READ,
    PERMISSIONS.NOTIFICATIONS.READ,
    PERMISSIONS.NOTIFICATIONS.MARK_READ,
  ],
};

export function getPermissionsForRole(role: Role): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  const permissions = getPermissionsForRole(user.role as Role);
  return permissions.includes(permission);
}