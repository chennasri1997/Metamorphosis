'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import CompletedTaskSection from '@/components/organisms/CompletedTaskSection';
import TaskList from '@/components/organisms/TaskList';
import TaskView from '@/components/organisms/TaskView';
import { BRIDGE_COLOR } from '@/lib/theme';
import type { Task } from '@/lib/types';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState('');
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [selectedRowEl, setSelectedRowEl] = useState<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [seamPatch, setSeamPatch] = useState<{ top: number; height: number } | null>(null);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const completedTasks = tasks.filter((task) => task.completed);

  useEffect(() => {
    let isCurrent = true;
    fetch('/api/tasks')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Could not load tasks.');
        if (isCurrent) setTasks(data as Task[]);
      })
      .catch((error: unknown) => {
        if (isCurrent) setLoadError(error instanceof Error ? error.message : 'Could not load tasks.');
      })
      .finally(() => {
        if (isCurrent) setIsLoadingTasks(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  // Measure the selected row so we can paint over the border seam at exactly its height.
  useLayoutEffect(() => {
    if (!selectedRowEl || !containerRef.current) {
      setSeamPatch(null);
      return;
    }
    const rowRect = selectedRowEl.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setSeamPatch({ top: rowRect.top - containerRect.top, height: rowRect.height });
  }, [selectedRowEl, selectedTaskId]);

  const toggleStep = async (stepId: number, completed: boolean) => {
    if (selectedTaskId === null) return;
    try {
      const response = await fetch(`/api/steps/${stepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Could not update step.');
      const taskResponse = await fetch(`/api/tasks/${selectedTaskId}`);
      const updatedTask = await taskResponse.json();
      if (!taskResponse.ok) throw new Error(updatedTask.error ?? 'Could not refresh task.');
      setTasks((previous) => previous.map((task) => (task.id === selectedTaskId ? updatedTask as Task : task)));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not update step.');
    }
  };

  const addStep = async (taskId: number, text: string) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addStep: text }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Could not save step.');
    const updatedTask = data as Task;
    setTasks((previous) => previous.map((task) => (task.id === taskId ? updatedTask : task)));
  };

  const createTask = async (title: string) => {
    const today = new Date();
    const deadline = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, deadline, steps: [] }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Could not save task.');
    const createdTask = data as Task;
    setTasks((previous) => [...previous, createdTask]);
    setSelectedTaskId(createdTask.id);
  };

  const toggleTaskCompletion = async (taskId: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Could not update task.');
      const updatedTask = data as Task;
      setTasks((previous) => previous.map((task) => (task.id === taskId ? updatedTask : task)));
      setSelectedTaskId(completed ? null : taskId);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not update task.');
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div ref={containerRef} className="relative mx-auto grid max-w-5xl grid-cols-1 items-start gap-0 sm:grid-cols-2">
        <div className="relative z-20 w-full sm:col-span-1">
          <TaskList
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            onSelectedRowElement={setSelectedRowEl}
            onToggleComplete={toggleTaskCompletion}
            canAddTask={!isLoadingTasks && !loadError && tasks.length < 9}
            onCreateTask={createTask}
            loadError={loadError}
          />
          <CompletedTaskSection tasks={completedTasks} onToggleComplete={toggleTaskCompletion} />
        </div>
        <div className="h-96 sm:col-span-1">
          <TaskView task={selectedTask} onToggleStep={toggleStep} onAddStep={addStep} />
        </div>
        {seamPatch && (
          <div
            className="pointer-events-none absolute hidden sm:block"
            style={{
              left: 'calc(50% - 2px)',
              top: seamPatch.top,
              height: seamPatch.height,
              width: '4px',
              backgroundColor: BRIDGE_COLOR,
              zIndex: 30,
            }}
          />
        )}
      </div>
    </main>
  );
}
