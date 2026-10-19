'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addTask } from '@/lib/storage';
import type { RepeatRule, Tag } from '@/lib/types';

const TAGS: Tag[] = ['Mental', 'Physical', 'General'];
const POINTS_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function NewTaskPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [tag, setTag] = useState<Tag>('Mental');
  const [points, setPoints] = useState(1);
  const [repeat, setRepeat] = useState<RepeatRule>('Never');

  const [dateEnabled, setDateEnabled] = useState(false);
  const [dateValue, setDateValue] = useState('');

  const [timeEnabled, setTimeEnabled] = useState(false);
  const [timeValue, setTimeValue] = useState('');

  const canSave = name.trim().length > 0;

  const handleCreate = () => {
    if (!canSave) return;

    const activeAt = new Date();
    if (dateEnabled && dateValue) {
      const [y, m, d] = dateValue.split('-').map(Number);
      activeAt.setFullYear(y, m - 1, d);
    }
    if (timeEnabled && timeValue) {
      const [hh, mm] = timeValue.split(':').map(Number);
      activeAt.setHours(hh, mm, 0, 0);
    } else if (dateEnabled) {
      activeAt.setHours(0, 0, 0, 0);
    }

    addTask({
      name: name.trim(),
      tag,
      points,
      repeat,
      activeAt: activeAt.getTime(),
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-4">
        <Link href="/" className="text-sm font-medium text-indigo-500">
          Cancel
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">New Task</h1>
      </header>

      <main className="mx-auto max-w-md space-y-5 p-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-900">Task name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning run"
            className="w-full rounded-lg border border-gray-200 p-3 text-base"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900">Date</label>
            <input
              type="checkbox"
              checked={dateEnabled}
              onChange={(e) => setDateEnabled(e.target.checked)}
              className="h-5 w-5"
            />
          </div>
          {dateEnabled && (
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 p-3 text-base"
            />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900">Time</label>
            <input
              type="checkbox"
              checked={timeEnabled}
              onChange={(e) => setTimeEnabled(e.target.checked)}
              className="h-5 w-5"
            />
          </div>
          {timeEnabled && (
            <input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 p-3 text-base"
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-900">Repeat</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as RepeatRule)}
            className="w-full rounded-lg border border-gray-200 p-3 text-base"
          >
            <option value="Never">Never</option>
            <option value="Daily">Daily</option>
          </select>
        </div>

        {repeat === 'Daily' && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-900">End repeat</label>
            <select disabled value="Never" className="w-full rounded-lg border border-gray-200 p-3 text-base text-gray-400">
              <option value="Never">Never</option>
            </select>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-900">Tag</label>
          <div className="flex gap-2">
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`flex-1 rounded-lg border p-2.5 text-sm font-semibold ${
                  tag === t ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-200 text-gray-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-900">Points</label>
          <select
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 p-3 text-base"
          >
            {POINTS_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={!canSave}
          className="w-full rounded-xl bg-indigo-500 p-3.5 text-base font-bold text-white disabled:opacity-40"
        >
          Create task
        </button>
      </main>
    </div>
  );
}
