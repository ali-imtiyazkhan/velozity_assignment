import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import type { ProjectListItem } from '../../types/api';

interface ProjectCardProps {
  project: ProjectListItem;
  onEdit?: (project: ProjectListItem) => void;
  onDelete?: (projectId: string) => void;
  onView?: (project: ProjectListItem) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onView }: ProjectCardProps) {
  const taskCount = project._count?.tasks || 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
            {project.client && (
              <Badge variant="info" className="text-xs">{project.client.name}</Badge>
            )}
          </div>
          {project.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              👤 {project.manager?.name || 'Unassigned'}
            </span>
            <span className="flex items-center gap-1">
              📋 {taskCount} tasks
            </span>
            <span className="flex items-center gap-1">
              📅 Created {formatDate(project.createdAt)}
            </span>
          </div>
        </div>
        <Dropdown trigger={<Button variant="ghost" size="sm">⋮</Button>}>
          <DropdownItem label="👁️ View" onClick={() => onView?.(project)} />
          <DropdownItem label="✏️ Edit" onClick={() => onEdit?.(project)} />
          {onDelete && (
            <DropdownItem label="🗑️ Delete" onClick={() => onDelete?.(project.id)} danger />
          )}
        </Dropdown>
      </div>
    </div>
  );
}