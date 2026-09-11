'use client';

import { useState } from 'react';
import { useActivity } from '@/api/hooks';
import { Card, CardContent, Badge, Avatar, Input } from '@/components/ui';
import { formatRelativeTime, formatStatus } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export default function ActivityPage() {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const { data: activityData, isLoading } = useActivity({
    search,
    projectId: projectFilter,
  });

  const activity = activityData?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Feed</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Recent activity across all projects</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {activity.length === 0 ? (
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-white">{item.user?.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">{item.action.toLowerCase().replace(/_/g, ' ')}</span>
                        <Badge variant="gray">{item.entityType}</Badge>
                        {item.task && (
                          <Badge variant="info">#{item.task.id.slice(0, 8)}</Badge>
                        )}
                      </div>
                      {item.oldValue && item.newValue && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Changed from <span className="font-medium">{item.oldValue}</span> to <span className="font-medium">{item.newValue}</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeTime(item.createdAt)}</p>
                    </div>
                    {item.project && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.project.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}