import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import type { TaskListItem } from '../../types/api';
import type { TaskStatus } from '../../types/models';

interface TaskListProps {
  tasks: TaskListItem[];
  loading?: boolean;
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: TaskListItem) => void;
  onDelete: (taskId: string) => void;
  onCreate: () => void;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export function TaskList({ 
  tasks, 
  loading, 
  projects, 
  users, 
  onUpdateStatus, 
  onEdit, 
  onDelete, 
  onCreate,
  meta,
  onPageChange
}: TaskListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          {meta && (
            <span className="text-sm text-gray-500">
              {meta.total} total
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            🔍 Filters
          </Button>
          <Button onClick={() => { setCreatingTask(true); onCreate(); }}>
            + New Task
          </Button>
        </div>
      </div>

      {showFilters && (
        <TaskFilters 
          projects={projects} 
          users={users} 
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-24" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm">Create your first task or adjust filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateStatus={onUpdateStatus}
              onEdit={() => { setEditingTask(task); onEdit(task); }}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => onPageChange(meta.page - 1)} 
              disabled={meta.page === 1}
            >
              Previous
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => onPageChange(meta.page + 1)} 
              disabled={meta.page === meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
        <TaskForm
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={async () => {}}
          initialData={editingTask || undefined}
          projects={projects}
          users={users}
          title="Edit Task"
        />
      </Modal>

      <Modal isOpen={creatingTask} onClose={() => setCreatingTask(false)} title="Create Task">
        <TaskForm
          isOpen={creatingTask}
          onClose={() => setCreatingTask(false)}
          onSubmit={async () => {}}
          projects={projects}
          users={users}
          title="Create Task"
        />
      </Modal>
    </div>
  );
}