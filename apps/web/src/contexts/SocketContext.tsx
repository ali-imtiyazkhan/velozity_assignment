'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { ServerToClientEvents, ClientToServerEvents, ActivityEvent, NotificationEvent } from '@/types/socket';

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  updateTaskStatus: (taskId: string, newStatus: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function SocketProvider({ children }: { children: ReactNode }) {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { addNotification, incrementUnreadCount } = useNotificationStore();
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef<Map<string, Set<Function>>>(new Map());

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('activity:new', (event: ActivityEvent) => {
      console.log('Activity event:', event);
    });

    newSocket.on('activity:catchup', (events: ActivityEvent[]) => {
      console.log('Activity catchup:', events.length, 'events');
    });

    newSocket.on('notification:new', (event: NotificationEvent) => {
      addNotification(event as any);
      incrementUnreadCount();
    });

    newSocket.on('notification:read', ({ notificationId }) => {
      console.log('Notification read:', notificationId);
    });

    newSocket.on('notification:unread-count', ({ count }) => {
      useNotificationStore.getState().setUnreadCount(count);
    });

    newSocket.on('presence:online', (data) => {
      console.log('User online:', data);
    });

    newSocket.on('presence:offline', (data) => {
      console.log('User offline:', data);
    });

    newSocket.on('presence:users', (users) => {
      console.log('Online users:', users);
    });

    newSocket.on('task:status-update', (event) => {
      console.log('Task status update:', event);
    });

    newSocket.on('project:update', (event) => {
      console.log('Project update:', event);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, accessToken, addNotification, incrementUnreadCount]);

  const joinProject = useCallback((projectId: string) => {
    socket?.emit('join:project', projectId);
  }, [socket]);

  const leaveProject = useCallback((projectId: string) => {
    socket?.emit('leave:project', projectId);
  }, [socket]);

  const updateTaskStatus = useCallback((taskId: string, newStatus: string) => {
    socket?.emit('task:status-update', { taskId, newStatus });
  }, [socket]);

  const markNotificationRead = useCallback((notificationId: string) => {
    socket?.emit('notification:mark-read', notificationId);
  }, [socket]);

  const markAllNotificationsRead = useCallback(() => {
    socket?.emit('notification:mark-all-read');
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinProject,
        leaveProject,
        updateTaskStatus,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}