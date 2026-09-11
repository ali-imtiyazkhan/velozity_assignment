import type { Server as HttpServer } from 'http';
import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { Role } from 'db';

export type { Role };

export interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: Role;
  userEmail: string;
  userName: string;
}

export interface ServerToClientEvents {
  'activity:new': (data: ActivityEvent) => void;
  'activity:catchup': (data: ActivityEvent[]) => void;
  'notification:new': (data: NotificationEvent) => void;
  'notification:read': (data: { notificationId: string }) => void;
  'notification:count': (data: { count: number }) => void;
  'presence:user-online': (data: PresenceEvent) => void;
  'presence:user-offline': (data: PresenceEvent) => void;
  'presence:online-users': (data: PresenceEvent[]) => void;
  'task:status-changed': (data: TaskStatusEvent) => void;
  'project:updated': (data: ProjectEvent) => void;
  'project:joined': (data: { projectId: string }) => void;
  'project:left': (data: { projectId: string }) => void;
  'error': (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  'auth': (token: string) => void;
  'join:project': (projectId: string) => void;
  'leave:project': (projectId: string) => void;
  'join:presence': () => void;
  'leave:presence': () => void;
  'activity:fetch': (data: { projectId?: string; limit?: number }) => void;
  'notification:mark-read': (notificationId: string) => void;
  'notification:mark-all-read': () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  userRole: Role;
  userEmail: string;
  userName: string;
  joinedProjects: Set<string>;
  joinedPresence: boolean;
  avatarUrl: string | null;
}

export interface ActivityEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  userId: string;
  projectId: string;
  taskId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  taskId: string | null;
  readAt: string | null;
  createdAt: string;
  task?: {
    id: string;
    title: string;
    projectId: string;
  } | null;
}

export interface PresenceEvent {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: Role;
  avatarUrl: string | null;
  onlineAt: string;
}

export interface TaskStatusEvent {
  taskId: string;
  projectId: string;
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
}

export interface ProjectEvent {
  projectId: string;
  action: 'created' | 'updated' | 'deleted';
  data: Record<string, unknown>;
}

export type { SocketIOServer as Server };