import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useDebounce } from '../../hooks/useDebounce';
import type { TaskStatus, Priority } from '../../types/models';

interface TaskFiltersProps {
  projects: { id: string; name: string }[];
  users: { id: string; name: string }[];
  onChange?: (filters: TaskFiltersState) => void;
}

interface TaskFiltersState {
  search: string;
  status: TaskStatus | '';
  priority: Priority | '';
  projectId: string;
  assigneeId: string;
  isOverdue: '' | 'true' | 'false';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

const initialFilters: TaskFiltersState = {
  search: '',
  status: '',
  priority: '',
  projectId: '',
  assigneeId: '',
  isOverdue: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title' },
];

export function TaskFilters({ projects, users, onChange }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<TaskFiltersState>(() => {
    const params = new URLSearchParams(searchParams.toString());
    const isOverdueParam = params.get('isOverdue');
    return {
      search: params.get('search') || '',
      status: (params.get('status') as TaskStatus) || '',
      priority: (params.get('priority') as Priority) || '',
      projectId: params.get('projectId') || '',
      assigneeId: params.get('assigneeId') || '',
      isOverdue: (isOverdueParam === 'true' || isOverdueParam === 'false') ? isOverdueParam : '',
      sortBy: params.get('sortBy') || 'createdAt',
      sortOrder: (params.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(params.get('page') || '1', 10),
      limit: parseInt(params.get('limit') || '20', 10),
    };
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.projectId) params.set('projectId', filters.projectId);
    if (filters.assigneeId) params.set('assigneeId', filters.assigneeId);
    if (filters.isOverdue) params.set('isOverdue', filters.isOverdue);
    if (filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);
    if (filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit !== 20) params.set('limit', filters.limit.toString());

    router.push(`?${params.toString()}`, { scroll: false });
    onChange?.({ ...filters, search: debouncedSearch });
  }, [debouncedSearch, filters.status, filters.priority, filters.projectId, filters.assigneeId, filters.isOverdue, filters.sortBy, filters.sortOrder, filters.page, filters.limit, router, onChange]);

  const updateFilter = useCallback(<K extends keyof TaskFiltersState>(key: K, value: TaskFiltersState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : value as number }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const hasActiveFilters = filters.search || filters.status || filters.priority || filters.projectId || filters.assigneeId || filters.isOverdue;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select
              value={filters.status}
              onChange={e => updateFilter('status', e.target.value as TaskStatus)}
              options={statusOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <Select
              value={filters.priority}
              onChange={e => updateFilter('priority', e.target.value as Priority)}
              options={priorityOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <Select
              value={filters.projectId}
              onChange={e => updateFilter('projectId', e.target.value)}
              options={[{ value: '', label: 'All Projects' }, ...projects.map(p => ({ value: p.id, label: p.name }))]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
            <Select
              value={filters.assigneeId}
              onChange={e => updateFilter('assigneeId', e.target.value)}
              options={[{ value: '', label: 'All Users' }, ...users.map(u => ({ value: u.id, label: u.name }))]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overdue</label>
            <Select
              value={filters.isOverdue}
              onChange={e => updateFilter('isOverdue', e.target.value as '' | 'true' | 'false')}
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Overdue Only' },
                { value: 'false', label: 'Not Overdue' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <Select
              value={filters.sortBy}
              onChange={e => updateFilter('sortBy', e.target.value)}
              options={sortOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <Select
              value={filters.sortOrder}
              onChange={e => updateFilter('sortOrder', e.target.value as 'asc' | 'desc')}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
            <Select
              value={filters.limit.toString()}
              onChange={e => updateFilter('limit', parseInt(e.target.value, 10))}
              options={[
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' },
                { value: '100', label: '100' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}