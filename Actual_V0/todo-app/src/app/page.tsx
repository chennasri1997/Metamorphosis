'use client';

import { useEffect, useState } from 'react';
import CompletedTaskSection from '@/components/organisms/CompletedTaskSection';
import TaskList from '@/components/organisms/TaskList';
import TaskView from '@/components/organisms/TaskView';
import WingShape from '@/components/organisms/WingShape';
import DeleteTaskButton from '@/components/molecules/DeleteTaskButton';
import { palette } from '@/lib/theme';
import type { Task } from '@/lib/types';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pickedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // The wheel always has a selection: fall back to the first active task when none is picked.
  const selectedTask =
    tasks.find((task) => task.id === pickedTaskId && !task.completed) ??
    tasks.find((task) => !task.completed) ??
    null;
  const selectedTaskId = selectedTask?.id ?? null;
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

  const saveTask = async (
    taskId: number,
    updates: { title: string; deadline: string; steps: { id?: number; text: string }[] },
  ) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Could not save task.');
    const updatedTask = data as Task;
    setTasks((previous) => previous.map((task) => (task.id === taskId ? updatedTask : task)));
  };

  const deleteTask = async (taskId: number) => {
    const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Could not delete task.');
    setTasks((previous) => previous.filter((task) => task.id !== taskId));
    setEditingTaskId(null);
    setSelectedTaskId(null);
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
      setEditingTaskId(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not update task.');
    }
  };

  return (
    <main className="min-h-screen px-6 py-10" style={{ backgroundColor: palette.thistlePurple }}>
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-0 sm:grid-cols-2">
        <div className="w-full sm:col-span-1">
          <WingShape
            action={
              selectedTask ? (
                <DeleteTaskButton onConfirm={() => deleteTask(selectedTask.id)} />
              ) : null
            }
          >
          <TaskList
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={(taskId) => {
              setSelectedTaskId(taskId);
              setEditingTaskId(null);
            }}
            onToggleComplete={toggleTaskCompletion}
            editingTaskId={editingTaskId}
            draftTitle={draftTitle}
            onDraftTitleChange={setDraftTitle}
            onCancelEdit={() => setEditingTaskId(null)}
            canAddTask={!isLoadingTasks && !loadError && tasks.length < 9}
            onCreateTask={createTask}
            loadError={loadError}
          />
          <CompletedTaskSection tasks={completedTasks} onToggleComplete={toggleTaskCompletion} />
          </WingShape>
        </div>
        <div className="sm:col-span-1 sm:h-[368px] sm:self-start">
          <TaskView
            task={selectedTask}
            onToggleStep={toggleStep}
            onAddStep={addStep}
            onSaveTask={saveTask}
            editingTaskId={editingTaskId}
            draftTitle={draftTitle}
            onStartEditing={(task) => {
              setDraftTitle(task.title);
              setEditingTaskId(task.id);
            }}
            onStopEditing={() => setEditingTaskId(null)}
          />
        </div>
      </div>
    </main>
  );
}
