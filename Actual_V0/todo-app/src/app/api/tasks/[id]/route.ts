import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

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

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const task = getTaskWithSteps(Number(id));
  if (!task) return NextResponse.json({ error: 'task not found' }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const taskId = Number(id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as TaskRow | undefined;
  if (!existing) return NextResponse.json({ error: 'task not found' }, { status: 404 });

  const body = await request.json();
  const { title, deadline, completed, steps, addStep } = body as {
    title?: string;
    deadline?: string;
    completed?: boolean;
    steps?: { text: string }[];
    addStep?: string;
  };

  if (steps && steps.length > MAX_STEPS) {
    return NextResponse.json({ error: `a task can have at most ${MAX_STEPS} steps` }, { status: 400 });
  }
  if (typeof addStep === 'string' && !addStep.trim()) {
    return NextResponse.json({ error: 'step text is required' }, { status: 400 });
  }

  db.prepare('UPDATE tasks SET title = ?, deadline = ? WHERE id = ?').run(
    title ?? existing.title,
    deadline ?? existing.deadline,
    taskId,
  );

  if (steps) {
    db.transaction(() => {
      db.prepare('DELETE FROM steps WHERE taskId = ?').run(taskId);
      const insertStep = db.prepare('INSERT INTO steps (taskId, text, "order") VALUES (?, ?, ?)');
      steps.forEach((step, index) => insertStep.run(taskId, step.text, index + 1));
      db.prepare('UPDATE tasks SET completed = 0 WHERE id = ?').run(taskId);
    })();
  }

  if (typeof addStep === 'string') {
    const stepCount = (
      db.prepare('SELECT COUNT(*) as count FROM steps WHERE taskId = ?').get(taskId) as { count: number }
    ).count;
    if (stepCount >= MAX_STEPS) {
      return NextResponse.json({ error: `a task can have at most ${MAX_STEPS} steps` }, { status: 400 });
    }
    db.transaction(() => {
      db.prepare('INSERT INTO steps (taskId, text, "order") VALUES (?, ?, ?)').run(taskId, addStep.trim(), stepCount + 1);
      db.prepare('UPDATE tasks SET completed = 0 WHERE id = ?').run(taskId);
    })();
  }

  if (typeof completed === 'boolean') {
    db.transaction(() => {
      db.prepare('UPDATE steps SET completed = ? WHERE taskId = ?').run(completed ? 1 : 0, taskId);
      db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(completed ? 1 : 0, taskId);
    })();
  }

  return NextResponse.json(getTaskWithSteps(taskId));
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const taskId = Number(id);
  const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!existing) return NextResponse.json({ error: 'task not found' }, { status: 404 });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  return NextResponse.json({ success: true });
}
