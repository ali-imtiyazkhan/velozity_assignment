'use client';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface PMDashboardData {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedTasks: number;
    overdueTasks: number;
  };
  recentProjects: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    dueDate: string;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    project: string;
    dueDate: string;
    priority: string;
  }>;
}

interface PMDashboardProps {
  data: PMDashboardData;
}

export function PMDashboard({ data }: PMDashboardProps) {
  const { stats, recentProjects, upcomingDeadlines } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Manager Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Overview of your projects and team progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.activeProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.overdueTasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Due: {project.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-600 dark:bg-primary-500" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <Badge variant={project.status === 'active' ? 'success' : 'gray'}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{deadline.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{deadline.project} • Due: {deadline.dueDate}</p>
                  </div>
                  <Badge variant={deadline.priority === 'high' ? 'danger' : deadline.priority === 'medium' ? 'warning' : 'info'}>
                    {deadline.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}