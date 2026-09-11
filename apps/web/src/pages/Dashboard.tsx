'use client';

import { useAuthStore } from '@/store/authStore';
import { useAdminDashboard, usePMDashboard, useDeveloperDashboard } from '@/api/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge, Avatar } from '@/components/ui';
import { formatRelativeTime, getStatusColor, getPriorityColor, getRoleColor } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: adminData, isLoading: adminLoading } = useAdminDashboard();
  const { data: pmData, isLoading: pmLoading } = usePMDashboard();
  const { data: devData, isLoading: devLoading } = useDeveloperDashboard();

  const isLoading = adminLoading || pmLoading || devLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (user?.role === 'ADMIN' && adminData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">System overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={adminData.stats.totalUsers} icon="users" />
          <StatCard title="Total Projects" value={adminData.stats.totalProjects} icon="projects" />
          <StatCard title="Total Tasks" value={adminData.stats.totalTasks} icon="tasks" />
          <StatCard title="Overdue Tasks" value={adminData.stats.overdueTasks} icon="alert" variant="danger" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminData.recentActivity.slice(0, 5).map((activity: any) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overdue Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminData.overdueTasksList.slice(0, 5).map((task: any) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user?.role === 'PROJECT_MANAGER' && pmData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Manager Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your projects overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="My Projects" value={pmData.stats.myProjects} icon="projects" />
          <StatCard title="Total Tasks" value={pmData.stats.totalTasks} icon="tasks" />
          <StatCard title="In Review" value={pmData.stats.tasksInReview} icon="review" variant="info" />
          <StatCard title="Overdue" value={pmData.stats.overdueTasks} icon="alert" variant="danger" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pmData.projects.slice(0, 5).map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(pmData.priorityBreakdown).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <Badge variant={priority.toLowerCase() as any}>{formatPriority(priority)}</Badge>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Due Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pmData.upcomingDueDates.slice(0, 5).map((task: any) => (
                <TaskRow key={task.id} task={task} showProject />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role === 'DEVELOPER' && devData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Developer Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your assigned tasks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Assigned" value={devData.stats.assignedTasks} icon="tasks" />
          <StatCard title="In Progress" value={devData.stats.inProgress} icon="progress" variant="warning" />
          <StatCard title="In Review" value={devData.stats.inReview} icon="review" variant="info" />
          <StatCard title="Done" value={devData.stats.done} icon="check" variant="success" />
          <StatCard title="Overdue" value={devData.stats.overdue} icon="alert" variant="danger" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {devData.assignedTasks.slice(0, 10).map((task: any) => (
                <TaskRow key={task.id} task={task} showProject />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Due Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {devData.upcomingDueDates.slice(0, 5).map((task: any) => (
                <TaskRow key={task.id} task={task} showProject />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Velozity</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">Your dashboard will appear here</p>
    </div>
  );
}

function StatCard({ title, value, icon, variant = 'default' }: { title: string; value: number; icon: string; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const icons: Record<string, React.ReactNode> = {
    users: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    projects: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    tasks: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    alert: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    review: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    progress: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    check: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          </div>
          <div className={cn('p-3 rounded-lg', {
            'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400': variant === 'default',
            'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400': variant === 'success',
            'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400': variant === 'warning',
            'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400': variant === 'danger',
            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400': variant === 'info',
          })}>
            {icons[icon]}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <Avatar name={activity.user?.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">
          <span className="font-medium">{activity.user?.name}</span> {activity.action.toLowerCase().replace(/_/g, ' ')}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatRelativeTime(activity.createdAt)}</p>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <h4 className="font-medium text-gray-900 dark:text-white truncate">{project.name}</h4>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant={project.status?.toLowerCase() as any}>{project.status}</Badge>
        <span className="text-xs text-gray-500 dark:text-gray-400">{project._count?.tasks || 0} tasks</span>
      </div>
    </div>
  );
}

function TaskRow({ task, showProject }: { task: any; showProject?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge className={getStatusColor(task.status)}>{formatStatus(task.status)}</Badge>
          <Badge className={getPriorityColor(task.priority)}>{formatPriority(task.priority)}</Badge>
          {showProject && task.project && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{task.project.name}</span>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500 dark:text-gray-400">{formatRelativeTime(task.dueDate)}</p>
        {task.isOverdue && (
          <Badge variant="danger" className="mt-1">Overdue</Badge>
        )}
      </div>
    </div>
  );
}

function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
}