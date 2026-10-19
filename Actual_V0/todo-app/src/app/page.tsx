'use client';

import { useState } from 'react';
import TaskCard from '@/components/organisms/TaskCard';
import type { Task } from '@/lib/types';

// Placeholder data for layout review — real API wiring comes in the next step.
const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Grocery list',
    deadline: '2026-10-20',
    completed: false,
    createdAt: '2026-10-18',
    steps: [
      { id: 1, taskId: 1, text: 'Milk', completed: true, order: 1 },
      { id: 2, taskId: 1, text: 'Eggs', completed: false, order: 2 },
      { id: 3, taskId: 1, text: 'Bread', completed: false, order: 3 },
    ],
  },
  {
    id: 2,
    title: 'Call the dentist',
    deadline: '2026-10-19',
    completed: false,
    createdAt: '2026-10-18',
    steps: [],
  },
  {
    id: 3,
    title: 'Finish report',
    deadline: '2026-10-25',
    completed: true,
    createdAt: '2026-10-18',
    steps: [
      { id: 4, taskId: 3, text: 'Draft outline', completed: true, order: 1 },
      { id: 5, taskId: 3, text: 'Write sections', completed: true, order: 2 },
    ],
  },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const toggleStep = (taskId: number, stepId: number, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const steps = task.steps.map((s) => (s.id === stepId ? { ...s, completed } : s));
        const allDone = steps.length > 0 && steps.every((s) => s.completed);
        return { ...task, steps, completed: allDone };
      }),
    );
  };

  const toggleTask = (taskId: number, completed: boolean) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed } : task)));
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-semibold">My Tasks</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStep={(stepId, completed) => toggleStep(task.id, stepId, completed)}
              onToggleTask={(completed) => toggleTask(task.id, completed)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
