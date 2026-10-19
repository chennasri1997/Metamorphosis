import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const MAX_TASKS = 9;
const MAX_STEPS = 9;

interface TaskRow {
  id: number;
  title: string;
  deadline: string;
  completed: number;
  createdAt: string;
}

interface StepRow {
  id: number;
  taskId: number;
  text: string;
  completed: number;
  order: number;
}

function getTaskWithSteps(id: number) {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
  if (!task) return null;
  const steps = db
    .prepare('SELECT * FROM steps WHERE taskId = ? ORDER BY "order" ASC')
    .all(id) as StepRow[];
  return { ...task, completed: !!task.completed, steps: steps.map((s) => ({ ...s, completed: !!s.completed })) };
}

export async function GET() {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY createdAt ASC').all() as TaskRow[];
  const result = tasks.map((t) => getTaskWithSteps(t.id));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, deadline, steps } = body as { title?: string; deadline?: string; steps?: string[] };

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  if (!deadline || typeof deadline !== 'string') {
    return NextResponse.json({ error: 'deadline is required' }, { status: 400 });
  }
  if (steps && steps.length > MAX_STEPS) {
    return NextResponse.json({ error: `a task can have at most ${MAX_STEPS} steps` }, { status: 400 });
  }

  const taskCount = (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }).count;
  if (taskCount >= MAX_TASKS) {
    return NextResponse.json({ error: `a maximum of ${MAX_TASKS} tasks is allowed` }, { status: 400 });
  }

  const insertTask = db.prepare('INSERT INTO tasks (title, deadline) VALUES (?, ?)');
  const info = insertTask.run(title, deadline);
  const taskId = info.lastInsertRowid as number;

  if (steps && steps.length > 0) {
    const insertStep = db.prepare('INSERT INTO steps (taskId, text, "order") VALUES (?, ?, ?)');
    steps.forEach((text, index) => insertStep.run(taskId, text, index + 1));
  }

  return NextResponse.json(getTaskWithSteps(taskId), { status: 201 });
}
