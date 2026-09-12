'use client';

import { ChevronDown, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useId } from 'react';
import Gauge from '../ui/Gauge';

const ORANGE = '#ef4d23';

function CardHeader({ title, period }: { title: string; period: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="font-medium text-[#ef4d23]">{title}</span>
      <span className="text-gray-500 dark:text-gray-400">{period}</span>
    </div>
  );
}

function TogglePill({
  active,
  inactive,
}: {
  active: string;
  inactive: string;
}) {
  return (
    <div className="flex rounded-full bg-gray-100 dark:bg-gray-800 p-1 text-[12px] font-medium">
      <button
        type="button"
        className="flex-1 rounded-full bg-white dark:bg-gray-700 px-3 py-1.5 text-gray-900 dark:text-white shadow"
      >
        {active}
      </button>
      <button
        type="button"
        className="flex-1 rounded-full px-3 py-1.5 text-gray-500 dark:text-gray-400"
      >
        {inactive}
      </button>
    </div>
  );
}

function Dropdown({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1 block text-[12px] text-gray-700 dark:text-gray-300">{label}</span>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-left text-[13px] text-gray-900 dark:text-white"
      >
        {value}
        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" strokeWidth={2} />
      </button>
    </div>
  );
}

function TargetInput({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[12px] text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 focus-within:border-gray-400 dark:focus-within:border-gray-500">
        <span className="text-[13px] text-gray-400 dark:text-gray-500">#</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          defaultValue={defaultValue}
          className="w-full bg-transparent text-[13px] text-gray-900 dark:text-white outline-none"
        />
      </div>
    </div>
  );
}

function TasksCard() {
  return (
    <div className="flex flex-col rounded-2xl bg-white dark:bg-gray-900 p-5 border border-gray-200 dark:border-gray-700">
      <CardHeader title="Tasks" period="This Week" />
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[28px] font-semibold leading-none">24</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400">
          <TrendingUp className="h-3 w-3" strokeWidth={2} />
          +12%
        </span>
      </div>
      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Compared to last week</p>
      <p className="mt-4 text-center text-[12px] text-gray-600 dark:text-gray-400">
        Weekly target achieved
      </p>
      <div className="mt-1">
        <Gauge value={78} color={ORANGE} showLabels min="180" max="230" />
      </div>
      <div className="mt-auto pt-4">
        <TogglePill active="Completed" inactive="Pending" />
      </div>
    </div>
  );
}

function ProjectsCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white dark:bg-gray-900 p-5 border border-gray-200 dark:border-gray-700">
      <Dropdown label="Show figures for" value="This month" />
      <Dropdown label="Compare period by" value="Month-to-date (MTD)" />
      <TargetInput label="Set targets (This month)" defaultValue="10" />
      <TargetInput label="Set targets (This quarter)" defaultValue="35" />
      <div className="mt-auto flex items-center gap-4 pt-1">
        <button
          type="button"
          className="rounded-lg bg-[#ef4d23] px-5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Save
        </button>
        <button
          type="button"
          className="text-[13px] text-gray-700 dark:text-gray-300 underline underline-offset-2"
        >
          Cancel
        </button>
        <button
          type="button"
          className="ml-auto p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function ActivityCard() {
  return (
    <div className="flex flex-col rounded-2xl bg-white dark:bg-gray-900 p-5 border border-gray-200 dark:border-gray-700">
      <CardHeader title="Activity" period="Today" />
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[28px] font-semibold leading-none">0</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-400">
          <TrendingUp className="h-3 w-3" strokeWidth={2} />0
        </span>
      </div>
      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Compared to yesterday</p>
      <div className="mt-5">
        <Gauge value={68} color="#9ca3af" />
      </div>
      <div className="mt-auto pt-4">
        <TogglePill active="All Events" inactive="My Events" />
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <div className="px-3 sm:px-4">
      <div className="mx-auto w-full max-w-[880px] rounded-3xl bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <TasksCard />
          <ProjectsCard />
          <ActivityCard />
        </div>
      </div>
    </div>
  );
}