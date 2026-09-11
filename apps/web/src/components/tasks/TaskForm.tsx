import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { TaskStatus, Priority } from '../../types/models';
import type { TaskListItem } from '../../types/api';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Partial<TaskFormData> | null;
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
  loading?: boolean;
  title?: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  projectId: string;
  assigneeId: string;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export function TaskForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  projects, 
  users,
  loading,
  title = 'Create Task'
}: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projectId: '',
      assigneeId: '',
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        projectId: '',
        assigneeId: '',
        ...initialData,
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        projectId: '',
        assigneeId: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Form submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <Input
            {...register('title', { required: 'Title is required' })}
            placeholder="Enter task title"
            error={errors.title?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Textarea
            {...register('description')}
            placeholder="Enter task description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
            <Select
              {...register('projectId', { required: 'Project is required' })}
              options={projects.map(p => ({ value: p.id, label: p.name }))}
              placeholder="Select project"
              error={errors.projectId?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <Select
              {...register('assigneeId')}
              options={users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))}
              placeholder="Select assignee"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              {...register('status')}
              options={statusOptions}
              placeholder="Select status"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <Select
              {...register('priority')}
              options={priorityOptions}
              placeholder="Select priority"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
          <Input
            type="date"
            {...register('dueDate', { required: 'Due date is required' })}
            error={errors.dueDate?.message}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting || loading}>
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}