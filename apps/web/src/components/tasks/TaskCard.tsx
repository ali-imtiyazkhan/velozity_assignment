import { formatRelativeTime, formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import type { TaskListItem } from '../../types/api';
import type { TaskStatus, Priority } from '../../types/models';

interface TaskCardProps {
  task: TaskListItem;
  onUpdateStatus?: (taskId: string, status: TaskStatus) => void;
  onEdit?: (task: TaskListItem) => void;
  onDelete?: (taskId: string) => void;
  showProject?: boolean;
}

const statusColors: Record<TaskStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  TODO: 'default',
  IN_PROGRESS: 'info',
  IN_REVIEW: 'warning',
  DONE: 'success',
};

const priorityColors: Record<Priority, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'danger',
};

const statusOrder: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export function TaskCard({ task, onUpdateStatus, onEdit, onDelete, showProject }: TaskCardProps) {
  const isOverdue = task.isOverdue && task.status !== 'DONE';
  const currentStatusIndex = statusOrder.indexOf(task.status);
  const nextStatus = statusOrder[currentStatusIndex + 1];

  return (
    <div className={`bg-white rounded-lg border ${isOverdue ? 'border-red-200' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
              <Badge variant={statusColors[task.status]}>{task.status.replace('_', ' ')}</Badge>
              <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
              {isOverdue && <Badge variant="danger">Overdue</Badge>}
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {showProject && task.project && (
                <span className="flex items-center gap-1">
                  📁 {task.project.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                📅 Due {formatDate(task.dueDate)}
              </span>
              {task.assignee && (
                <span className="flex items-center gap-1">
                  <Avatar src={task.assignee.avatarUrl} name={task.assignee.name} size="xs" />
                  {task.assignee.name}
                </span>
              )}
            </div>
          </div>
          <Dropdown trigger={<Button variant="ghost" size="sm">⋮</Button>}>
            {nextStatus && (
              <DropdownItem
                label={`→ ${nextStatus.replace('_', ' ')}`}
                onClick={() => onUpdateStatus?.(task.id, nextStatus)}
              />
            )}
            <DropdownItem label="✏️ Edit" onClick={() => onEdit?.(task)} />
            {onDelete && (
              <DropdownItem label="🗑️ Delete" onClick={() => onDelete?.(task.id)} danger />
            )}
          </Dropdown>
        </div>
      </div>
    </div>
  );
}