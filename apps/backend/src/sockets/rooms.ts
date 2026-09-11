import type { AuthenticatedSocket } from './types';
import type { Server as SocketIOServer } from 'socket.io';
import type { Role } from 'db';

export function getProjectRoom(projectId: string): string {
  return `project:${projectId}`;
}

export function getUserRoom(userId: string): string {
  return `user:${userId}`;
}

export function getAdminRoom(): string {
  return 'role:admin';
}

export function getPmRoom(managerId: string): string {
  return `role:pm:${managerId}`;
}

export function getDeveloperRoom(userId: string): string {
  return `role:developer:${userId}`;
}

export function getPresenceRoom(): string {
  return 'presence';
}

export function joinProjectRoom(socket: AuthenticatedSocket, projectId: string) {
  const room = getProjectRoom(projectId);
  socket.join(room);
  socket.data.joinedProjects.add(projectId);
}

export function leaveProjectRoom(socket: AuthenticatedSocket, projectId: string) {
  const room = getProjectRoom(projectId);
  socket.leave(room);
  socket.data.joinedProjects.delete(projectId);
}

export function joinPresence(socket: AuthenticatedSocket) {
  const room = getPresenceRoom();
  socket.join(room);
  socket.data.joinedPresence = true;
}

export function leavePresence(socket: AuthenticatedSocket) {
  const room = getPresenceRoom();
  socket.leave(room);
  socket.data.joinedPresence = false;
}

export function broadcastToProject(io: SocketIOServer, projectId: string, event: string, data: unknown) {
  io.to(getProjectRoom(projectId)).emit(event, data);
}

export function broadcastToUser(io: SocketIOServer, userId: string, event: string, data: unknown) {
  io.to(getUserRoom(userId)).emit(event, data);
}

export function broadcastToAdmins(io: SocketIOServer, event: string, data: unknown) {
  io.to(getAdminRoom()).emit(event, data);
}

export function broadcastToPm(io: SocketIOServer, managerId: string, event: string, data: unknown) {
  io.to(getPmRoom(managerId)).emit(event, data);
}

export function broadcastToDeveloper(io: SocketIOServer, userId: string, event: string, data: unknown) {
  io.to(getDeveloperRoom(userId)).emit(event, data);
}

export function broadcastToPresence(io: SocketIOServer, event: string, data: unknown) {
  io.to(getPresenceRoom()).emit(event, data);
}

export function getUserRooms(userId: string, userRole: Role, projectIds: string[] = []): string[] {
  const rooms: string[] = [getUserRoom(userId)];

  if (userRole === 'ADMIN') {
    rooms.push(getAdminRoom());
  } else if (userRole === 'PROJECT_MANAGER') {
    rooms.push(getPmRoom(userId));
  } else if (userRole === 'DEVELOPER') {
    rooms.push(getDeveloperRoom(userId));
  }

  rooms.push(...projectIds.map(getProjectRoom));

  return rooms;
}