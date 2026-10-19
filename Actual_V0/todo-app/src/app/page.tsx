'use client';

import { useState } from 'react';
import TaskList from '@/components/organisms/TaskList';
import TaskView from '@/components/organisms/TaskView';
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
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  const toggleStep = (stepId: number, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== selectedTaskId) return task;
        const steps = task.steps.map((s) => (s.id === stepId ? { ...s, completed } : s));
        const allDone = steps.length > 0 && steps.every((s) => s.completed);
        return { ...task, steps, completed: allDone };
      }),
    );
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="h-48 sm:col-span-1">
          <TaskList tasks={tasks} selectedTaskId={selectedTaskId} onSelectTask={setSelectedTaskId} />
        </div>
        <div className="h-96 sm:col-span-2">
          <TaskView task={selectedTask} onToggleStep={toggleStep} />
        </div>
      </div>
    </main>
  );
}
