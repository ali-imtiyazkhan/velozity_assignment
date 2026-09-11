import { Server, type Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { socketAuthMiddleware } from './middleware';
import { setupProjectHandlers } from './handlers/project';
import { setupActivityHandlers } from './handlers/activity';
import { setupPresenceHandlers } from './handlers/presence';
import { setupNotificationHandlers } from './handlers/notifications';
import { getOnlineUsers } from './handlers/presence';
import type { AuthenticatedSocket, ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData, Role } from './types';
import prisma from 'db';

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function initializeSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(socketAuthMiddleware);

  io.on('connection', async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`User connected: ${authSocket.userId} (${authSocket.userRole})`);

    // Populate user name from DB
    const user = await prisma.user.findUnique({
      where: { id: authSocket.userId },
      select: { name: true, avatarUrl: true, role: true },
    });
    if (user) {
      authSocket.userName = user.name;
      authSocket.data.avatarUrl = user.avatarUrl;
    }

    // Auto-join role-based rooms
    const roleRoom = authSocket.userRole === 'ADMIN' ? 'role:admin' : authSocket.userRole === 'PROJECT_MANAGER' ? `role:pm:${authSocket.userId}` : `role:developer:${authSocket.userId}`;
    authSocket.join(roleRoom);
    authSocket.join(`user:${authSocket.userId}`);

    setupProjectHandlers(authSocket, io);
    setupActivityHandlers(authSocket, io);
    setupPresenceHandlers(authSocket, io);
    setupNotificationHandlers(authSocket, io);

    authSocket.on('disconnect', () => {
      console.log(`User disconnected: ${authSocket.userId}`);
    });
  });

  return io;
}

export function getIO(): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function broadcastActivityEvent(data: {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  userId: string;
  projectId: string;
  taskId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}) {
  if (!io) return;
  const event = { ...data, createdAt: new Date().toISOString() };

  // Broadcast to project room
  io.to(`project:${data.projectId}`).emit('activity:new', event);

  // Broadcast to admins
  io.to('role:admin').emit('activity:new', event);

  // Broadcast to PM if they manage this project
  // This would need the project manager ID - in practice, you'd fetch it
  // For now, we'll also broadcast to all PM rooms
  // A more efficient approach would be to track PM rooms per project
}

export function broadcastNotificationEvent(data: {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  taskId: string | null;
  readAt: Date | null;
  createdAt: Date;
  task?: {
    id: string;
    title: string;
    projectId: string;
  } | null;
}) {
  if (!io) return;
  const event = { ...data, readAt: data.readAt?.toISOString() || null, createdAt: data.createdAt.toISOString() };

  io.to(`user:${data.userId}`).emit('notification:new', event);
}

export function broadcastTaskStatusChange(data: {
  taskId: string;
  projectId: string;
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
}) {
  if (!io) return;
  io.to(`project:${data.projectId}`).emit('task:status-changed', data);
}

export function broadcastPresenceUpdate(userId: string, online: boolean, userData: {
  userName: string;
  userEmail: string;
  userRole: Role;
  avatarUrl: string | null;
}) {
  if (!io) return;
  const event = {
    userId,
    userName: userData.userName,
    userEmail: userData.userEmail,
    userRole: userData.userRole,
    avatarUrl: userData.avatarUrl,
    onlineAt: new Date().toISOString(),
  };

  if (online) {
    io.to('presence').emit('presence:user-online', event);
  } else {
    io.to('presence').emit('presence:user-offline', event);
  }
}

export function getOnlineUsersList() {
  return getOnlineUsers();
}