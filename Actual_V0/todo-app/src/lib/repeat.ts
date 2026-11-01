import db from '@/lib/db';
import { REPEAT_VALUES, type Repeat } from '@/lib/types';

export function isRepeat(value: unknown): value is Repeat {
  return typeof value === 'string' && (REPEAT_VALUES as readonly string[]).includes(value);
}

export function nextDeadline(deadline: string, repeat: Repeat): string {
  const [year, month, day] = deadline.split('-').map(Number);
  let targetYear = year;
  let targetMonth = month - 1;
  let targetDay = day;

  if (repeat === 'daily') targetDay += 1;
  else if (repeat === 'weekly') targetDay += 7;
  else if (repeat === 'biweekly') targetDay += 14;
  else if (repeat === 'monthly' || repeat === 'yearly') {
    targetMonth += repeat === 'monthly' ? 1 : 12;
    targetYear += Math.floor(targetMonth / 12);
    targetMonth %= 12;
    // Clamp to the last day of the target month (e.g. Jan 31 -> Feb 28).
    targetDay = Math.min(day, new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate());
  }

  return new Date(Date.UTC(targetYear, targetMonth, targetDay)).toISOString().slice(0, 10);
}

// Creates the next occurrence of a repeating task once it has been completed. Runs at most once per task.
export function spawnRepeatIfNeeded(taskId: number) {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as
    | { id: number; title: string; deadline: string; completed: number; repeat: Repeat; repeatSpawned: number }
    | undefined;
  if (!task || task.completed !== 1 || task.repeat === 'never' || task.repeatSpawned === 1) return;

  db.transaction(() => {
    const info = db
      .prepare('INSERT INTO tasks (title, deadline, repeat) VALUES (?, ?, ?)')
      .run(task.title, nextDeadline(task.deadline, task.repeat), task.repeat);
    const steps = db.prepare('SELECT text, "order" FROM steps WHERE taskId = ? ORDER BY "order" ASC').all(taskId) as {
      text: string;
      order: number;
    }[];
    const insertStep = db.prepare('INSERT INTO steps (taskId, text, "order") VALUES (?, ?, ?)');
    steps.forEach((step) => insertStep.run(info.lastInsertRowid, step.text, step.order));
    db.prepare('UPDATE tasks SET repeatSpawned = 1 WHERE id = ?').run(taskId);
  })();
}
