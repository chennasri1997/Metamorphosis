import type { Task } from './types';

const STORAGE_KEY = 'v0app-state';

interface StoredState {
  tasks: Task[];
  completions: Record<string, string[]>; // taskId -> completed date keys ('YYYY-MM-DD')
  totalPoints: number;
}

const DEFAULT_STATE: StoredState = { tasks: [], completions: {}, totalPoints: 0 };

export interface TaskWithStatus extends Task {
  completedToday: boolean;
}

function loadState(): StoredState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return JSON.parse(raw) as StoredState;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: StoredState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getTodayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addTask(input: Omit<Task, 'id'>): void {
  const state = loadState();
  state.tasks.push({ ...input, id: generateId() });
  saveState(state);
}

export function getVisibleTasks(todayKey: string): TaskWithStatus[] {
  const state = loadState();
  const now = Date.now();
  const completedIds = new Set(
    Object.entries(state.completions)
      .filter(([, dates]) => dates.includes(todayKey))
      .map(([taskId]) => taskId)
  );

  // One-time (Never) tasks disappear once completed; Daily tasks always show.
  return state.tasks
    .filter((t) => t.activeAt <= now)
    .filter((t) => t.repeat === 'Daily' || !completedIds.has(t.id))
    .map((t) => ({ ...t, completedToday: completedIds.has(t.id) }));
}

export function toggleTaskCompletion(task: TaskWithStatus, todayKey: string): void {
  const state = loadState();
  const dates = state.completions[task.id] ?? [];

  if (task.completedToday) {
    state.completions[task.id] = dates.filter((d) => d !== todayKey);
    state.totalPoints = Math.max(0, state.totalPoints - task.points);
  } else {
    state.completions[task.id] = dates.includes(todayKey) ? dates : [...dates, todayKey];
    state.totalPoints += task.points;
  }

  saveState(state);
}

export function getTotalPoints(): number {
  return loadState().totalPoints;
}

export function resetProgress(): void {
  const state = loadState();
  state.totalPoints = 0;
  saveState(state);
}
