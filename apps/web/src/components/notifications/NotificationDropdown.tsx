'use client';

import { useState, useEffect, useRef } from 'react';
import { useNotifications, useUnreadNotificationCount, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/api/hooks';
import { Avatar, Badge } from '@/components/ui';
import { formatRelativeTime, truncate } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import type { Notification } from '@/types';

interface NotificationDropdownProps {
  trigger: React.ReactNode;
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationDropdown({ trigger, onNotificationClick }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: notificationsData } = useNotifications({ limit: 20 });
  const { data: unreadCount } = useUnreadNotificationCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = notificationsData?.data || [];
  const count = unreadCount || 0;

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
    if (onNotificationClick) {
      const notification = notifications.find(n => n.id === id);
      if (notification) onNotificationClick(notification);
    }
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {count > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className={cn(
                        'w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                        !notification.readAt && 'bg-primary-50/50 dark:bg-primary-900/20'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6M6 4l6 6 6-6M6 20l6-6 6 6" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm font-medium', !notification.readAt ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400')}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.readAt && (
                          <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <a href="/notifications" className="block text-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}