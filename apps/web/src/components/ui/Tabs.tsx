'use client';

import { cn } from '@/utils/cn';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
  return <div className={cn(className)} data-default-value={defaultValue}>{children}</div>;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  const tabs = document.querySelector('[data-default-value]');
  const defaultValue = tabs?.getAttribute('data-default-value');
  const isActive = defaultValue === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      data-disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events disabled:opacity-50',
        isActive
          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
        className
      )}
      onClick={() => {
        if (disabled) return;
        const tabList = tabs?.closest('[role="tablist"]');
        if (tabList) {
          tabList.querySelectorAll('[role="tab"]').forEach((tab) => {
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('data-state', 'inactive');
            tab.classList.remove('bg-white', 'dark:bg-gray-900', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            tab.classList.add('text-gray-700', 'dark:text-gray-300');
          });
        }
        tabs?.setAttribute('data-default-value', value);
        const panel = document.getElementById(`panel-${value}`);
        if (panel) {
          panel.hidden = false;
        }
        document.querySelectorAll('[role="tabpanel"]').forEach((p) => {
          if (p.id !== `panel-${value}`) p.hidden = true;
        });
      }}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const tabs = document.querySelector('[data-default-value]');
  const defaultValue = tabs?.getAttribute('data-default-value');
  const isActive = defaultValue === value;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={cn('mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2', className)}
    >
      {children}
    </div>
  );
}