import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const stepId = Number(id);
  const step = db.prepare('SELECT * FROM steps WHERE id = ?').get(stepId) as
    | { id: number; taskId: number; completed: number }
    | undefined;
  if (!step) return NextResponse.json({ error: 'step not found' }, { status: 404 });

  const body = await request.json();
  const { completed } = body as { completed: boolean };

  db.prepare('UPDATE steps SET completed = ? WHERE id = ?').run(completed ? 1 : 0, stepId);

  // Auto-complete the parent task once every one of its steps is checked off.
  const counts = db
    .prepare('SELECT COUNT(*) as total, SUM(completed) as done FROM steps WHERE taskId = ?')
    .get(step.taskId) as { total: number; done: number | null };
  const taskCompleted = counts.total > 0 && counts.done === counts.total;
  db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(taskCompleted ? 1 : 0, step.taskId);

  return NextResponse.json({ success: true });
}
