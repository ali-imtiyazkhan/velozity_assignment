'use client';

import { useEffect, useState } from 'react';
import { useAdminDashboard, usePMDashboard, useDeveloperDashboard } from '@/api/hooks';
import { useSocket } from '@/hooks/useSocket';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { formatRelativeTime } from '@/utils/formatters';
import type { AdminDashboardStats, PMDashboardStats, DeveloperDashboardStats } from '@/api/hooks/useDashboard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {trend && <p className="text-xs text-green-600 dark:text-green-400 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </Card>
  );
}

export function AdminDashboard({ data }: { data: AdminDashboardStats }) {
  const [onlineUsers, setOnlineUsers] = useState(data?.onlineUsers ?? 0);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleCount = (event: { count: number }) => setOnlineUsers(event.count);
    socket.on('presence:count', handleCount);
    return () => {
      socket.off('presence:count', handleCount);
    };
  }, [socket]);

  const stats = [
    { title: 'Total Users', value: data?.totalUsers ?? 0, icon: '👥', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { title: 'Total Projects', value: data?.totalProjects ?? 0, icon: '📁', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { title: 'Total Tasks', value: data?.totalTasks ?? 0, icon: '📋', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { title: 'Overdue Tasks', value: data?.overdueTasks ?? 0, icon: '⚠️', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    { title: 'Online Users', value: onlineUsers, icon: '🟢', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks by Status</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(data?.tasksByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{status.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks by Priority</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(data?.tasksByPriority || {}).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">{priority}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users by Role</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(data?.usersByRole || {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">{role.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="p-4">
            <ActivityFeed limit={10} />
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PMDashboard({ data }: { data: PMDashboardStats }) {
  const stats = [
    { title: 'My Projects', value: data?.myProjects ?? 0, icon: '📁', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { title: 'Total Tasks', value: data?.totalTasks ?? 0, icon: '📋', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { title: 'Overdue Tasks', value: data?.overdueTasks ?? 0, icon: '⚠️', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Manager Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks by Status</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(data?.tasksByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{status.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks by Priority</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(data?.tasksByPriority || {}).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">{priority}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h2>
          </div>
          <div className="p-4 space-y-3">
            {(data?.upcomingDeadlines || []).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming deadlines</p>
            ) : (
              (data?.upcomingDeadlines || []).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{task.project?.name || 'Project'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="warning">{new Date(task.dueDate).toLocaleDateString()}</Badge>
                    <Badge variant="default" className="ml-1">{task.priority}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="p-4">
            <ActivityFeed limit={10} />
          </div>
        </Card>
      </div>
    </div>
  );
}

export function DeveloperDashboard({ data }: { data: DeveloperDashboardStats }) {
  const stats = [
    { title: 'Assigned Tasks', value: data?.assignedTasks ?? 0, icon: '📋', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { title: 'Overdue Tasks', value: data?.overdueTasks ?? 0, icon: '⚠️', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks by Status</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(data?.tasksByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 capitalize">{status.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks by Priority</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(data?.tasksByPriority || {}).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">{priority}</span>
                <span className="font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h2>
          </div>
          <div className="p-4 space-y-3">
            {(data?.upcomingTasks || []).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming tasks</p>
            ) : (
              (data?.upcomingTasks || []).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{task.project?.name || 'Project'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="warning">{new Date(task.dueDate).toLocaleDateString()}</Badge>
                    <Badge variant="default" className="ml-1">{task.priority}</Badge>
                    <Badge variant="default" className="ml-1">{task.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="p-4">
            <ActivityFeed limit={10} />
          </div>
        </Card>
      </div>
    </div>
  );
}