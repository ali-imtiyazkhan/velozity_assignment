'use client';

import { useParams } from 'next/navigation';
import { useProject, useProjectTasks, useProjectActivity } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { formatDate, formatRelativeTime, formatStatus, formatPriority, getStatusColor, getPriorityColor } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/ui';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasksData, isLoading: tasksLoading } = useProjectTasks(projectId);
  const { data: activityData, isLoading: activityLoading } = useProjectActivity(projectId);

  if (projectLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project not found</h1>
      </div>
    );
  }

  const tasks = tasksData?.data || [];
  const activity = activityData || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {project._count?.tasks || 0} tasks
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">{project.client?.name}</p>
            {project.client?.company && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{project.client.company}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Manager</p>
            <div className="flex items-center gap-2 mt-1">
              <Avatar name={project.manager?.name} size="sm" />
              <span className="font-medium text-gray-900 dark:text-white">{project.manager?.name}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">{formatDate(project.createdAt)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList className="w-full">
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity ({activity.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="p-0">
              {tasksLoading ? (
                <div className="p-4 animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}
                </div>
              ) : tasks.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a task to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
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
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs mt-1">{task.description}</p>
                            )}
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
                            <Badge className={getStatusColor(task.status)}>{formatStatus(task.status)}</Badge>
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
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-0">
              {activityLoading ? (
                <div className="p-4 animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}
                </div>
              ) : activity.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No activity</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Activity will appear here as changes are made.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activity.map((item: any) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-start gap-3">
                        <Avatar name={item.user?.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{item.user?.name}</span>{' '}
                            {item.action.toLowerCase().replace(/_/g, ' ')}
                            <span className="text-gray-500 dark:text-gray-400 ml-1">{item.entityType.toLowerCase()}</span>
                          </p>
                          {item.oldValue && item.newValue && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Changed from <span className="font-medium">{item.oldValue}</span> to <span className="font-medium">{item.newValue}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeTime(item.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}