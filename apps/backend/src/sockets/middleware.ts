import type { Socket } from 'socket.io';
import { verifyAccessToken } from '../shared/utils/jwt';
import type { TokenPayload } from '../shared/utils/jwt';
import type { Role } from 'db';
import type { AuthenticatedSocket } from './types';

type NextFunction = (err?: Error) => void;

export function socketAuthMiddleware(
  socket: Socket,
  next: NextFunction
) {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = verifyAccessToken(token);
    const authSocket = socket as AuthenticatedSocket;
    authSocket.userId = payload.userId;
    authSocket.userRole = payload.role as Role;
    authSocket.userEmail = payload.email;
    authSocket.userName = ''; // Will be populated from DB
    authSocket.data.joinedProjects = new Set();
    authSocket.data.joinedPresence = false;
    authSocket.data.avatarUrl = null;
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
}