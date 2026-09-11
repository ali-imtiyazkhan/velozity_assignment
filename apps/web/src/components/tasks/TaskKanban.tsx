import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import type { TaskListItem } from '../../types/api';
import type { TaskStatus } from '../../types/models';

interface TaskKanbanProps {
  tasks: TaskListItem[];
  loading?: boolean;
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: TaskListItem) => void;
  onDelete: (taskId: string) => void;
  onCreate: () => void;
}

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'TODO', label: 'To Do', color: 'bg-gray-100' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50' },
  { status: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-50' },
  { status: 'DONE', label: 'Done', color: 'bg-green-50' },
];

export function TaskKanban({ 
  tasks, 
  loading, 
  projects, 
  users, 
  onUpdateStatus, 
  onEdit, 
  onDelete, 
  onCreate
}: TaskKanbanProps) {
  const [editingTask, setEditingTask] = useState<TaskListItem | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);

  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.status] = tasks.filter(t => t.status === col.status);
    return acc;
  }, {} as Record<TaskStatus, TaskListItem[]>);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col.status} className="w-72 flex-shrink-0">
            <div className={`p-3 rounded-lg ${col.color}`}>
              <h3 className="font-medium text-gray-900">{col.label}</h3>
            </div>
            <div className="h-96 bg-gray-50 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(col => (
        <div key={col.status} className="w-72 flex-shrink-0 flex flex-col">
          <div className={`p-3 rounded-t-lg ${col.color} flex items-center justify-between`}>
            <h3 className="font-medium text-gray-900">{col.label}</h3>
            <span className="text-sm text-gray-500 bg-white/50 px-2 py-0.5 rounded-full">
              {tasksByStatus[col.status]?.length || 0}
            </span>
          </div>
          <div className={`flex-1 p-2 space-y-3 ${col.color} rounded-b-lg min-h-[500px]`}>
            {tasksByStatus[col.status]?.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">
                No tasks
              </div>
            ) : (
              tasksByStatus[col.status]?.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdateStatus={onUpdateStatus}
                  onEdit={() => { setEditingTask(task); onEdit(task); }}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}