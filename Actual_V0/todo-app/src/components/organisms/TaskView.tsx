import { Card } from 'antd';
import DateBadge from '@/components/atoms/DateBadge';
import StepRow from '@/components/molecules/StepRow';
import { BRIDGE_COLOR } from '@/lib/theme';
import type { Task } from '@/lib/types';

interface TaskViewProps {
  task: Task | null;
  onToggleStep: (stepId: number, completed: boolean) => void;
}

export default function TaskView({ task, onToggleStep }: TaskViewProps) {
  return (
    <Card className="h-full" style={task ? { backgroundColor: BRIDGE_COLOR } : undefined} styles={{ body: { height: '100%' } }}>
      {task && (
        <div>
          <div className="flex justify-end">
            <DateBadge date={task.deadline} />
          </div>

          {task.steps.length > 0 ? (
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
          ) : (
            <p className="mt-3 text-neutral-400">No steps for this task.</p>
          )}
        </div>
      )}
    </Card>
  );
}

