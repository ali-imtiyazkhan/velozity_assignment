import type { AuthenticatedSocket, PresenceEvent } from '../types';
import type { Server as SocketIOServer } from 'socket.io';
import type { Role } from 'db';
import { joinPresence, leavePresence, broadcastToPresence } from '../rooms';
import prisma from 'db';

const onlineUsers = new Map<string, { socket: AuthenticatedSocket; onlineAt: Date }>();

export function setupPresenceHandlers(socket: AuthenticatedSocket, io: SocketIOServer) {
  socket.on('join:presence', async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: socket.userId },
        select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      });

      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      joinPresence(socket);
      onlineUsers.set(socket.userId, { socket, onlineAt: new Date() });

      // Send current online users to the new user
      const currentUsers = Array.from(onlineUsers.values()).map(u => ({
        userId: u.socket.userId,
        userName: u.socket.userName,
        userEmail: u.socket.userEmail,
        userRole: u.socket.userRole,
        avatarUrl: u.socket.data.avatarUrl || null,
        onlineAt: u.onlineAt.toISOString(),
      }));

      socket.emit('presence:online-users', currentUsers);

      // Broadcast to others that this user is online
      const presenceEvent: PresenceEvent = {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        avatarUrl: user.avatarUrl,
        onlineAt: new Date().toISOString(),
      };

      broadcastToPresence(io, 'presence:user-online', presenceEvent);
    } catch {
      socket.emit('error', { message: 'Failed to join presence' });
    }
  });

  socket.on('leave:presence', () => {
    handleUserOffline(socket, io);
  });

  socket.on('disconnect', () => {
    handleUserOffline(socket, io);
  });
}

function handleUserOffline(socket: AuthenticatedSocket, io: SocketIOServer) {
  if (socket.data.joinedPresence) {
    leavePresence(socket);
    const userData = onlineUsers.get(socket.userId);
    onlineUsers.delete(socket.userId);

    if (userData) {
      const presenceEvent: PresenceEvent = {
        userId: socket.userId,
        userName: userData.socket.userName,
        userEmail: userData.socket.userEmail,
        userRole: userData.socket.userRole as Role,
        avatarUrl: userData.socket.data.avatarUrl || null,
        onlineAt: userData.onlineAt.toISOString(),
      };

      broadcastToPresence(io, 'presence:user-offline', presenceEvent);
    }
  }
}

export function getOnlineUsers(): PresenceEvent[] {
  return Array.from(onlineUsers.values()).map(u => ({
    userId: u.socket.userId,
    userName: u.socket.userName,
    userEmail: u.socket.userEmail,
    userRole: u.socket.userRole as Role,
    avatarUrl: u.socket.data.avatarUrl || null,
    onlineAt: u.onlineAt.toISOString(),
  }));
}

export function getOnlineUsersCount(): number {
  return onlineUsers.size;
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}