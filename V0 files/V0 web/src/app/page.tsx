'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getVisibleTasks,
  toggleTaskCompletion,
  getTotalPoints,
  resetProgress,
  getTodayKey,
  type TaskWithStatus,
} from '@/lib/storage';
import { getLevelInfo } from '@/lib/leveling';

const TAG_COLORS: Record<string, string> = {
  Mental: 'bg-indigo-500',
  Physical: 'bg-emerald-500',
  General: 'bg-gray-400',
};

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const reload = useCallback(() => {
    setTasks(getVisibleTasks(getTodayKey()));
    setTotalPoints(getTotalPoints());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleToggle = (task: TaskWithStatus) => {
    toggleTaskCompletion(task, getTodayKey());
    reload();
  };

  const levelInfo = getLevelInfo(totalPoints);

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Daily Tasks</h1>
        <Link
          href="/new-task"
          className="rounded-full bg-indigo-500 px-3 py-1 text-xl font-semibold leading-none text-white"
        >
          +
        </Link>
      </header>

      <main className="flex-1 space-y-2.5 p-4 pb-32">
        {tasks.length === 0 && (
          <p className="mt-10 text-center text-sm text-gray-400">No tasks yet. Tap + to add one.</p>
        )}
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => handleToggle(task)}
            className="flex w-full items-center gap-3 rounded-xl bg-white p-3.5 text-left shadow-sm"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                task.completedToday ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
              }`}
            >
              {task.completedToday && <span className="text-xs font-bold text-white">✓</span>}
            </span>
            <span className="flex-1">
              <span
                className={`block text-base font-medium ${
                  task.completedToday ? 'text-gray-400 line-through' : 'text-gray-900'
                }`}
              >
                {task.name}
              </span>
              <span className="mt-1 flex items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold text-white ${TAG_COLORS[task.tag]}`}>
                  {task.tag}
                </span>
                <span className="text-xs text-gray-400">{task.points} pts</span>
              </span>
            </span>
          </button>
        ))}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">Level {levelInfo.level}</span>
          <span className="text-xs text-gray-400">
            {levelInfo.pointsIntoLevel} / {levelInfo.pointsForNextLevel} pts
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${Math.min(100, levelInfo.progress * 100)}%` }}
          />
        </div>
      </footer>

      {/* Hidden dev/test control: transparent tap target, resets level progress to 0 */}
      <button
        aria-hidden
        onClick={() => {
          resetProgress();
          reload();
        }}
        className="fixed bottom-0 left-0 h-10 w-10"
      />
    </div>
  );
}

