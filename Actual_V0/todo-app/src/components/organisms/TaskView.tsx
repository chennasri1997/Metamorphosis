import { CloseOutlined, DownOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Input } from 'antd';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import DateBadge from '@/components/atoms/DateBadge';
import StepRow from '@/components/molecules/StepRow';
import { palette } from '@/lib/theme';
import type { Task } from '@/lib/types';

interface TaskViewProps {
  task: Task | null;
  onToggleStep: (stepId: number, completed: boolean) => void;
  onAddStep: (taskId: number, text: string) => Promise<void>;
  highlightGradient?: CSSProperties;
}

export default function TaskView({ task, onToggleStep, onAddStep, highlightGradient }: TaskViewProps) {
  const [addingTaskId, setAddingTaskId] = useState<number | null>(null);
  const [collapsedStepsTaskId, setCollapsedStepsTaskId] = useState<number | null>(null);
  const [stepText, setStepText] = useState('');
  const [stepError, setStepError] = useState('');
  const [isSavingStep, setIsSavingStep] = useState(false);

  async function submitStep(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = stepText.trim();
    if (!task || !text || isSavingStep) return;

    setIsSavingStep(true);
    setStepError('');
    try {
      await onAddStep(task.id, text);
      setStepText('');
      setAddingTaskId(null);
    } catch (error) {
      setStepError(error instanceof Error ? error.message : 'Could not save step.');
    } finally {
      setIsSavingStep(false);
    }
  }

  function cancelStep() {
    setStepText('');
    setStepError('');
    setAddingTaskId(null);
  }

  function startAddingStep() {
    if (!task) return;
    setStepText('');
    setStepError('');
    setAddingTaskId(task.id);
  }

  const stepInput = task && (
    <form onSubmit={submitStep} className="mt-3 flex items-center gap-2">
      <Input
        autoFocus
        aria-label="Step name"
        placeholder="Step name"
        value={stepText}
        disabled={isSavingStep}
        onChange={(event) => setStepText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') cancelStep();
        }}
      />
      <Button
        type="text"
        htmlType="button"
        aria-label="Cancel adding step"
        icon={<CloseOutlined />}
        disabled={isSavingStep}
        onClick={cancelStep}
      />
    </form>
  );

  const addStepButton = task && task.steps.length < 9 && (
    <div className="mt-2 flex justify-center">
      <Button
        type="text"
        aria-label="Add another step"
        title="Add another step"
        icon={<PlusOutlined style={{ fontSize: 21, fontWeight: 600 }} />}
        style={{
          width: 36,
          height: 36,
          padding: 0,
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          color: palette.charcoal,
        }}
        onClick={startAddingStep}
      />
    </div>
  );
  const isStepsExpanded = task !== null && collapsedStepsTaskId !== task.id;

  return (
    <Card
      className="h-full"
      style={{ backgroundColor: palette.warmPaleYellow, ...(task ? highlightGradient : undefined) }}
      styles={{ body: { height: '100%', padding: 0 } }}
    >
      {task ? (
        <div>
          <div className="flex h-14 items-center px-6">
            <DateBadge date={task.deadline} />
          </div>

          <div className="px-6">
            {task.steps.length > 0 ? (
              <section>
                <button
                  type="button"
                  aria-expanded={isStepsExpanded}
                  aria-controls={`task-steps-${task.id}`}
                  className="flex w-full items-center gap-3 py-3 text-left"
                  style={{
                    color: palette.charcoal,
                    fontSize: 21,
                    fontWeight: 600,
                  }}
                  onClick={() => setCollapsedStepsTaskId(isStepsExpanded ? task.id : null)}
                >
                  {isStepsExpanded ? <DownOutlined /> : <RightOutlined />}
                  <span>Steps ({task.steps.length})</span>
                </button>
                {isStepsExpanded && (
                  <div id={`task-steps-${task.id}`}>
                    <ul className="m-0 p-0">
                      {task.steps.map((step) => (
                        <StepRow
                          key={step.id}
                          text={step.text}
                          completed={step.completed}
                          onToggle={(completed) => onToggleStep(step.id, completed)}
                          isFirst={step.order === 1}
                        />
                      ))}
                    </ul>
                    {addingTaskId === task.id ? stepInput : addStepButton}
                  </div>
                )}
              </section>
            ) : addingTaskId === task.id ? null : (
              <div className="mt-3 flex flex-wrap items-center gap-x-2">
                <p className="m-0" style={{ color: palette.charcoal, fontSize: 18, fontWeight: 600 }}>
                  No steps for this task.
                </p>
                <Button
                  type="text"
                  style={{ padding: 0, height: 'auto', color: palette.steelBlue, fontSize: 18, fontWeight: 600 }}
                  onClick={() => {
                    setStepText('');
                    setStepError('');
                    setAddingTaskId(task.id);
                  }}
                >
                  Add a step.
                </Button>
              </div>
            )}

            {task.steps.length === 0 && addingTaskId === task.id && stepInput}
            {stepError && <Alert className="mt-2" type="error" showIcon message={stepError} />}
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="m-0" style={{ color: palette.charcoal, fontSize: 18, fontWeight: 600 }}>
            No task selected.
          </p>
        </div>
      )}
    </Card>
  );
}

