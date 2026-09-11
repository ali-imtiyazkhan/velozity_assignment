import { useState, useEffect, useCallback } from 'react';
import { useSocketEvents } from './useSocket';
import type { PresenceEvent } from '../types/socket';

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<PresenceEvent[]>([]);

  const handleOnlineUsers = useCallback((users: PresenceEvent[]) => {
    setOnlineUsers(users);
  }, []);

  const handleUserOnline = useCallback((user: PresenceEvent) => {
    setOnlineUsers(prev => {
      if (prev.some(u => u.userId === user.userId)) return prev;
      return [...prev, user];
    });
  }, []);

  const handleUserOffline = useCallback((user: PresenceEvent) => {
    setOnlineUsers(prev => prev.filter(u => u.userId !== user.userId));
  }, []);

  useSocketEvents(
    undefined,
    undefined,
    handleUserOnline,
    handleUserOffline
  );

  const getOnlineCount = useCallback(() => onlineUsers.length, [onlineUsers]);
  const isUserOnline = useCallback((userId: string) => onlineUsers.some(u => u.userId === userId), [onlineUsers]);
  const getOnlineUsersByRole = useCallback((role: string) => 
    onlineUsers.filter(u => u.userRole === role), [onlineUsers]);

  return {
    onlineUsers,
    onlineCount: onlineUsers.length,
    getOnlineCount,
    isUserOnline,
    getOnlineUsersByRole,
  };
}