import { useState, useEffect, useCallback } from 'react';
import { useSocketEvents } from '../../hooks/useSocket';
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

  useSocketEvents(undefined, undefined, undefined, undefined, undefined, handleCatchup);

  useEffect(() => {
    const { fetchActivity } = require('../../hooks/useSocket').useSocket();
    if (fetchActivity) {
      fetchActivity(projectId, limit);
    }
  }, [projectId, limit]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      const { fetchActivity } = require('../../hooks/useSocket').useSocket();
      if (fetchActivity) {
        fetchActivity(projectId, limit);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [projectId, limit, autoRefresh]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
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