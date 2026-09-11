import { formatRelativeTime } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import type { ActivityEvent } from '../../types/socket';

interface ActivityItemProps {
  activity: ActivityEvent;
}

const actionColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  CREATED: 'success',
  UPDATED: 'info',
  STATUS_CHANGED: 'warning',
  DELETED: 'danger',
  ASSIGNED: 'info',
  OVERDUE: 'danger',
};

const actionIcons: Record<string, string> = {
  CREATED: '✨',
  UPDATED: '✏️',
  STATUS_CHANGED: '🔄',
  DELETED: '🗑️',
  ASSIGNED: '👤',
  OVERDUE: '⚠️',
};

export function ActivityItem({ activity }: ActivityItemProps) {
  const color = actionColors[activity.action] || 'default';
  const icon = actionIcons[activity.action] || '📝';

  const getActionText = () => {
    switch (activity.action) {
      case 'CREATED':
        return `created ${activity.entityType.toLowerCase()}`;
      case 'UPDATED':
        return `updated ${activity.entityType.toLowerCase()}`;
      case 'STATUS_CHANGED':
        return `changed status from ${activity.oldValue} to ${activity.newValue}`;
      case 'DELETED':
        return `deleted ${activity.entityType.toLowerCase()}`;
      case 'ASSIGNED':
        return `assigned ${activity.entityType.toLowerCase()}`;
      case 'OVERDUE':
        return `marked ${activity.entityType.toLowerCase()} as overdue`;
      default:
        return `${activity.action.toLowerCase()} ${activity.entityType.toLowerCase()}`;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <Avatar src={activity.user.avatarUrl} name={activity.user.name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{activity.user.name}</span>
          <Badge variant={color} className="text-xs">{icon} {activity.action}</Badge>
          <span className="text-xs text-gray-500">{formatRelativeTime(activity.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{getActionText()}</p>
        {activity.entityType === 'TASK' && activity.taskId && (
          <p className="text-xs text-gray-400 mt-1 font-mono">Task: {activity.taskId}</p>
        )}
      </div>
    </div>
  );
}