'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import CompletedTaskSection from '@/components/organisms/CompletedTaskSection';
import TaskList from '@/components/organisms/TaskList';
import TaskView from '@/components/organisms/TaskView';
import { palette } from '@/lib/theme';
import type { Task } from '@/lib/types';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState('');
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [selectedRowEl, setSelectedRowEl] = useState<HTMLDivElement | null>(null);
  const [selectedTitleEl, setSelectedTitleEl] = useState<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const taskViewRef = useRef<HTMLDivElement>(null);
  const [selectedGradient, setSelectedGradient] = useState<CSSProperties | undefined>();
  const [detailGradient, setDetailGradient] = useState<CSSProperties | undefined>();
  const [seamPatch, setSeamPatch] = useState<{
    top: number;
    left: number;
    height: number;
    background: CSSProperties;
  } | null>(null);

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

  useLayoutEffect(() => {
    if (!selectedRowEl || !selectedTitleEl || !containerRef.current || !taskViewRef.current) {
      setSelectedGradient(undefined);
      setDetailGradient(undefined);
      setSeamPatch(null);
      return;
    }

    const updateGradient = () => {
      const rowRect = selectedRowEl.getBoundingClientRect();
      const titleRect = selectedTitleEl.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();
      const detailRect = taskViewRef.current!.getBoundingClientRect();
      const gradientWidth = containerRect.right - rowRect.left;
      const midpointPosition = Math.min(gradientWidth, titleRect.right - rowRect.left);
      const gradientImage = `linear-gradient(90deg, ${palette.swallowtailYellow} 0px, ${palette.gradientMidpoint} ${midpointPosition}px, ${palette.warmPaleYellow} ${gradientWidth}px)`;
      const gradientSize = `${gradientWidth}px 100%`;
      const background = {
        backgroundImage: gradientImage,
        backgroundSize: gradientSize,
        backgroundRepeat: 'no-repeat' as const,
      };

      setSelectedGradient({ ...background, backgroundPosition: 'left center' });
      setDetailGradient({
        ...background,
        backgroundPosition: `-${detailRect.left - rowRect.left}px center`,
        backgroundOrigin: 'border-box',
      });

      const seamLeft = detailRect.left - containerRect.left - 2;
      const seamOffset = seamLeft - (rowRect.left - containerRect.left);
      setSeamPatch({
        top: rowRect.top - containerRect.top,
        left: seamLeft,
        height: rowRect.height,
        background: { ...background, backgroundPosition: `-${seamOffset}px center` },
      });
    };

    updateGradient();
    window.addEventListener('resize', updateGradient);
    return () => window.removeEventListener('resize', updateGradient);
  }, [selectedRowEl, selectedTitleEl, selectedTaskId]);

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
            onSelectedTitleElement={setSelectedTitleEl}
            selectedGradient={selectedGradient}
            onToggleComplete={toggleTaskCompletion}
            canAddTask={!isLoadingTasks && !loadError && tasks.length < 9}
            onCreateTask={createTask}
            loadError={loadError}
          />
          <CompletedTaskSection tasks={completedTasks} onToggleComplete={toggleTaskCompletion} />
        </div>
        <div ref={taskViewRef} className="h-96 sm:col-span-1">
          <TaskView
            task={selectedTask}
            onToggleStep={toggleStep}
            onAddStep={addStep}
            highlightGradient={detailGradient}
          />
        </div>
        {seamPatch && (
          <div
            className="pointer-events-none absolute hidden sm:block"
            style={{
              left: seamPatch.left,
              top: seamPatch.top,
              height: seamPatch.height,
              width: '4px',
              zIndex: 30,
              ...seamPatch.background,
            }}
          />
        )}
      </div>
    </main>
  );
}
