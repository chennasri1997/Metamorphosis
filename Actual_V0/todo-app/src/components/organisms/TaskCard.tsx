import Checkbox from '@/components/atoms/Checkbox';
import DateBadge from '@/components/atoms/DateBadge';
import StepRow from '@/components/molecules/StepRow';
import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onToggleStep: (stepId: number, completed: boolean) => void;
  onToggleTask: (completed: boolean) => void;
}

export default function TaskCard({ task, onToggleStep, onToggleTask }: TaskCardProps) {
  const hasSteps = task.steps.length > 0;

  return (
    <div className={`rounded-lg border p-4 ${task.completed ? 'bg-neutral-50 border-neutral-200' : 'border-neutral-300'}`}>
      <div className="flex items-start justify-between gap-2">
        {hasSteps ? (
          <h3 className={task.completed ? 'line-through text-neutral-400' : 'font-medium'}>{task.title}</h3>
        ) : (
          <Checkbox checked={task.completed} onChange={onToggleTask} label={task.title} />
        )}
        <DateBadge date={task.deadline} />
      </div>

      {hasSteps && (
        <ul className="mt-2">
          {task.steps.map((step) => (
            <StepRow
              key={step.id}
              text={step.text}
              completed={step.completed}
              onToggle={(completed) => onToggleStep(step.id, completed)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
