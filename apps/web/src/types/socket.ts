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

export interface PresenceEvent {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
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

export type ServerToClientEvents = {
  'activity:new': (event: ActivityEvent) => void;
  'activity:catchup': (events: ActivityEvent[]) => void;
  'notification:new': (event: NotificationEvent) => void;
  'notification:read': (data: { notificationId: string }) => void;
  'notification:count': (data: { count: number }) => void;
  'presence:user-online': (data: PresenceEvent) => void;
  'presence:user-offline': (data: PresenceEvent) => void;
  'presence:online-users': (users: PresenceEvent[]) => void;
  'task:status-changed': (event: TaskStatusEvent) => void;
  'project:updated': (event: ProjectUpdateEvent) => void;
};