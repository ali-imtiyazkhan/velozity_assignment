import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import type { ActivityEvent, NotificationEvent, PresenceEvent, TaskStatusEvent } from '../types/socket';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useSocket(): {
  socket: Socket | null;
  isConnected: boolean;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  fetchActivity: (projectId?: string, limit?: number) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  updateTaskStatus: (taskId: string, newStatus: string) => void;
} {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join:presence');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  const joinProject = useCallback((projectId: string) => {
    socketRef.current?.emit('join:project', projectId);
  }, []);

  const leaveProject = useCallback((projectId: string) => {
    socketRef.current?.emit('leave:project', projectId);
  }, []);

  const fetchActivity = useCallback((projectId?: string, limit = 20) => {
    socketRef.current?.emit('activity:fetch', { projectId, limit });
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    socketRef.current?.emit('notification:mark-read', notificationId);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    socketRef.current?.emit('notification:mark-all-read');
  }, []);

  const updateTaskStatus = useCallback((taskId: string, newStatus: string) => {
    socketRef.current?.emit('task:status-update', { taskId, newStatus });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinProject,
    leaveProject,
    fetchActivity,
    markNotificationRead,
    markAllNotificationsRead,
    updateTaskStatus,
  };
}

type ActivityHandler = (event: ActivityEvent) => void;
type NotificationHandler = (event: NotificationEvent) => void;
type PresenceHandler = (event: PresenceEvent) => void;
type TaskStatusHandler = (event: TaskStatusEvent) => void;

export function useSocketEvents(
  onActivity?: ActivityHandler,
  onNotification?: NotificationHandler,
  onPresenceOnline?: PresenceHandler,
  onPresenceOffline?: PresenceHandler,
  onTaskStatusChange?: TaskStatusHandler,
  onActivityCatchup?: (events: ActivityEvent[]) => void
) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    if (onActivity) socket.on('activity:new', onActivity);
    if (onNotification) socket.on('notification:new', onNotification);
    if (onPresenceOnline) socket.on('presence:user-online', onPresenceOnline);
    if (onPresenceOffline) socket.on('presence:user-offline', onPresenceOffline);
    if (onTaskStatusChange) socket.on('task:status-changed', onTaskStatusChange);
    if (onActivityCatchup) socket.on('activity:catchup', onActivityCatchup);

    return () => {
      if (onActivity) socket.off('activity:new', onActivity);
      if (onNotification) socket.off('notification:new', onNotification);
      if (onPresenceOnline) socket.off('presence:user-online', onPresenceOnline);
      if (onPresenceOffline) socket.off('presence:user-offline', onPresenceOffline);
      if (onTaskStatusChange) socket.off('task:status-changed', onTaskStatusChange);
      if (onActivityCatchup) socket.off('activity:catchup', onActivityCatchup);
    };
  }, [socket, onActivity, onNotification, onPresenceOnline, onPresenceOffline, onTaskStatusChange, onActivityCatchup]);
}