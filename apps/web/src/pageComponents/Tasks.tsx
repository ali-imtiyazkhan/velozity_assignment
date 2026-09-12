'use client';

import { useState } from 'react';
import { useTasks, useUpdateTaskStatus } from '@/api/hooks';
import { useProjects } from '@/api/hooks';
import { useSocket } from '@/hooks/useSocket';
import { Button, Input, Select, Card, CardContent, Badge, Dropdown, DropdownItem, Avatar } from '@/components/ui';
import { formatDate, formatRelativeTime, formatStatus, formatPriority, getStatusColor, getPriorityColor } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type { TaskStatus } from '@/types';

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const { data: tasksData, isLoading, refetch } = useTasks({
    search,
    status: statusFilter,
    priority: priorityFilter,
    projectId: projectFilter,
  });
  const { data: projectsData } = useProjects();
  const updateStatusMutation = useUpdateTaskStatus();
  const { updateTaskStatus } = useSocket();

  const tasks = tasksData?.data || [];
  const projects = projectsData?.data || [];

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

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const handleStatusChange = (taskId: string, newStatus: TaskStatus, projectId: string, oldStatus: string) => {
    // Emit socket event for real-time updates
    updateTaskStatus(taskId, newStatus);
    
    // Also call the API
    updateStatusMutation.mutate({ id: taskId, status: newStatus }, {
      onSuccess: () => refetch(),
    });
  };

  const getStatusDropdownItems = (taskId: string, currentStatus: string, projectId: string): DropdownItem[] => {
    return statusOptions
      .filter((opt) => opt.value && opt.value !== currentStatus)
      .map((opt) => ({
        label: opt.label,
        onClick: () => handleStatusChange(taskId, opt.value as TaskStatus, projectId, currentStatus),
      }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track tasks</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              className="max-w-xs"
            />
            <Select
              placeholder="Filter by priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={priorityOptions}
              className="max-w-xs"
            />
            <Select
              placeholder="Filter by project"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={projectOptions}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or create a new task.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tasks.map((task: any) => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs mt-1">{task.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">{task.project?.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={task.assignee.name} size="xs" />
                            <span className="text-sm text-gray-900 dark:text-white">{task.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Dropdown
                          trigger={
                            <Badge className={cn('cursor-pointer', getStatusColor(task.status))}>
                              {formatStatus(task.status)}
                            </Badge>
                          }
                          items={getStatusDropdownItems(task.id, task.status, task.projectId)}
                          align="left"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getPriorityColor(task.priority)}>{formatPriority(task.priority)}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('text-sm', task.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')}>
                          {formatDate(task.dueDate)}
                          {task.isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatRelativeTime(task.createdAt)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}