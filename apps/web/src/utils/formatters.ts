import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(date: string | Date, formatStr = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase().replace('_', ' ');
}

export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
}

export function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase().replace('_', ' ');
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'CRITICAL':
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
    case 'HIGH':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
    case 'LOW':
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'DONE':
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
    case 'IN_REVIEW':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
    case 'IN_PROGRESS':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
    case 'TODO':
      return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200';
    case 'PROJECT_MANAGER':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
    case 'DEVELOPER':
      return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}