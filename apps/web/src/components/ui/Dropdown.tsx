'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownItemProps {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export function DropdownItem({ label, onClick, icon, danger, disabled, children }: DropdownItemProps) {
  return (
    <button
      onClick={() => {
        onClick();
      }}
      disabled={disabled}
      role="menuitem"
      className={cn(
        'w-full px-4 py-2 text-sm flex items-center gap-2 text-left',
        'hover:bg-gray-100 dark:hover:bg-gray-700',
        danger && 'text-red-600 dark:text-red-400',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {label}
      {children}
    </button>
  );
}

export interface DropdownProps {
  trigger: ReactNode;
  items?: DropdownItem[];
  children?: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items = [], children, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 min-w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              disabled={item.disabled}
              role="menuitem"
              className={cn(
                'w-full px-4 py-2 text-sm flex items-center gap-2 text-left',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                item.danger && 'text-red-600 dark:text-red-400',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
          {children}
        </div>
      )}
    </div>
  );
}