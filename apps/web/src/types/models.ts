export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type NotificationType = 'TASK_ASSIGNED' | 'TASK_IN_REVIEW' | 'TASK_OVERDUE' | 'STATUS_CHANGED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  managerId: string;
  createdAt: string;
  client?: Client;
  manager?: User;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  isOverdue: boolean;
  projectId: string;
  assigneeId?: string;
  creatorId: string;
  createdAt: string;
  project?: Project;
  assignee?: User | null;
}