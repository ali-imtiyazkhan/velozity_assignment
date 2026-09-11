import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ActivityFeed } from '../activity/ActivityFeed';
import type { DeveloperDashboardStats } from '../../types/api';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </Card>
  );
}

export function DeveloperDashboard({ data }: { data: DeveloperDashboardStats }) {
  const stats = [
    { title: 'Assigned Tasks', value: data.assignedTasks, icon: '📋', color: 'bg-blue-100 text-blue-600' },
    { title: 'Overdue Tasks', value: data.overdueTasks, icon: '⚠️', color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Tasks by Status</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(data.tasksByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Tasks by Priority</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(data.tasksByPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className="text-gray-600">{priority}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
          </div>
          <div className="p-4 space-y-3">
            {data.upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
            ) : (
              data.upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.project.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="warning">{formatDate(task.dueDate)}</Badge>
                    <Badge variant="default" className="ml-1">{task.priority}</Badge>
                    <Badge variant="default" className="ml-1">{task.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-4">
            <ActivityFeed limit={10} />
          </div>
        </Card>
      </div>
    </div>
  );
}