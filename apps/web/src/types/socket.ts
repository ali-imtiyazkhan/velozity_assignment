export interface SocketEvents {
  'activity:new': ActivityEvent;
  'activity:catchup': ActivityEvent[];
  'notification:new': NotificationEvent;
  'notification:read': { notificationId: string };
  'notification:unread-count': { count: number };
  'presence:online': { userId: string; name: string; avatarUrl?: string };
  'presence:offline': { userId: string };
  'presence:users': { userId: string; name: string; avatarUrl?: string }[];
  'task:status-update': TaskStatusUpdateEvent;
  'project:update': ProjectUpdateEvent;
}

export interface ActivityEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  projectId: string;
  taskId?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface NotificationEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  taskId?: string;
  readAt?: string;
  createdAt: string;
}

export interface TaskStatusUpdateEvent {
  taskId: string;
  oldStatus: string;
  newStatus: string;
  projectId: string;
  assigneeId?: string;
}

export interface ProjectUpdateEvent {
  projectId: string;
  name?: string;
  description?: string;
}

export type ClientToServerEvents = {
  'join:project': (projectId: string) => void;
  'leave:project': (projectId: string) => void;
  'task:status-update': (data: { taskId: string; newStatus: string }) => void;
  'notification:mark-read': (notificationId: string) => void;
  'notification:mark-all-read': () => void;
};

export type ServerToClientEvents = {
  'activity:new': (event: ActivityEvent) => void;
  'activity:catchup': (events: ActivityEvent[]) => void;
  'notification:new': (event: NotificationEvent) => void;
  'notification:read': (data: { notificationId: string }) => void;
  'notification:unread-count': (data: { count: number }) => void;
  'presence:online': (data: { userId: string; name: string; avatarUrl?: string }) => void;
  'presence:offline': (data: { userId: string }) => void;
  'presence:users': (users: { userId: string; name: string; avatarUrl?: string }[]) => void;
  'task:status-update': (event: TaskStatusUpdateEvent) => void;
  'project:update': (event: ProjectUpdateEvent) => void;
};