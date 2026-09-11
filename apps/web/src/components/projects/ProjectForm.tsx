import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { ProjectListItem } from '../../types/api';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  initialData?: Partial<ProjectFormData> | null;
  clients: { id: string; name: string }[];
  managers: { id: string; name: string; email: string }[];
  loading?: boolean;
  title?: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  clientId: string;
  managerId: string;
}

export function ProjectForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  clients, 
  managers,
  loading,
  title = 'Create Project'
}: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      clientId: '',
      managerId: '',
      ...initialData,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: '',
        description: '',
        clientId: '',
        managerId: '',
        ...initialData,
      });
    } else {
      reset({
        name: '',
        description: '',
        clientId: '',
        managerId: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: ProjectFormData) => {
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <Input
            {...register('name', { required: 'Name is required' })}
            placeholder="Enter project name"
            error={errors.name?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Textarea
            {...register('description')}
            placeholder="Enter project description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <Select
              {...register('clientId', { required: 'Client is required' })}
              options={clients.map(c => ({ value: c.id, label: c.name }))}
              placeholder="Select client"
              error={errors.clientId?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
            <Select
              {...register('managerId')}
              options={managers.map(m => ({ value: m.id, label: `${m.name} (${m.email})` }))}
              placeholder="Select manager"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting || loading}>
            {initialData ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}