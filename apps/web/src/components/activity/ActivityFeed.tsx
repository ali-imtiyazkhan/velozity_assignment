'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { ActivityItem } from './ActivityItem';
import type { ActivityEvent } from '../../types/socket';

interface ActivityFeedProps {
  projectId?: string;
  limit?: number;
  autoRefresh?: boolean;
}

export function ActivityFeed({ projectId, limit = 20, autoRefresh = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, fetchActivity, joinProject, leaveProject } = useSocket();

  const handleCatchup = useCallback((events: ActivityEvent[]) => {
    setActivities(events);
    setLoading(false);
  }, []);

  const handleNewActivity = useCallback((event: ActivityEvent) => {
    setActivities(prev => {
      if (prev.some(a => a.id === event.id)) return prev;
      return [event, ...prev].slice(0, 100);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('activity:new', handleNewActivity);
    socket.on('activity:catchup', handleCatchup);

    return () => {
      socket.off('activity:new', handleNewActivity);
      socket.off('activity:catchup', handleCatchup);
    };
  }, [socket, handleNewActivity, handleCatchup]);

  useEffect(() => {
    if (projectId) {
      joinProject(projectId);
      fetchActivity(projectId, limit);
    }
    return () => {
      if (projectId) leaveProject(projectId);
    };
  }, [projectId, limit, joinProject, leaveProject, fetchActivity]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (projectId) fetchActivity(projectId, limit);
    }, 30000);
    return () => clearInterval(interval);
  }, [projectId, limit, autoRefresh, fetchActivity]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No activity yet</p>
        <p className="text-sm">Activity will appear here when changes are made</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
      {activities.map(activity => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}