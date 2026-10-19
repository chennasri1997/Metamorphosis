import DateBadge from '@/components/atoms/DateBadge';
import StepRow from '@/components/molecules/StepRow';
import type { Task } from '@/lib/types';

interface TaskViewProps {
  task: Task | null;
  onToggleStep: (stepId: number, completed: boolean) => void;
}

export default function TaskView({ task, onToggleStep }: TaskViewProps) {
  return (
    <div className="h-full rounded-lg border border-neutral-300 bg-white">
      <h2 className="px-4 py-3 font-semibold border-b border-neutral-200">Task View</h2>

      {!task ? (
        <p className="px-4 py-3 text-neutral-400">Select a task from My Tasks to see its details.</p>
      ) : (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-medium">{task.title}</h3>
            <DateBadge date={task.deadline} />
          </div>

          {task.steps.length > 0 && (
            <ul className="mt-3">
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
      )}
    </div>
  );
}
