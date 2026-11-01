import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  RightOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Input } from 'antd';
import { useState } from 'react';
import DateBadge from '@/components/atoms/DateBadge';
import StepWheel from '@/components/organisms/StepWheel';
import WingPanel from '@/components/organisms/WingPanel';
import { palette } from '@/lib/theme';
import type { Task } from '@/lib/types';

interface TaskViewProps {
  task: Task | null;
  onToggleStep: (stepId: number, completed: boolean) => void;
  onAddStep: (taskId: number, text: string) => Promise<void>;
  onSaveTask: (
    taskId: number,
    updates: { title: string; deadline: string; steps: { id?: number; text: string }[] },
  ) => Promise<void>;
  editingTaskId: number | null;
  draftTitle: string;
  onStartEditing: (task: Task) => void;
  onStopEditing: () => void;
}

export default function TaskView({
  task,
  onToggleStep,
  onAddStep,
  onSaveTask,
  editingTaskId,
  draftTitle,
  onStartEditing,
  onStopEditing,
}: TaskViewProps) {
  const [addingTaskId, setAddingTaskId] = useState<number | null>(null);
  const [collapsedStepsTaskId, setCollapsedStepsTaskId] = useState<number | null>(null);
  const [stepText, setStepText] = useState('');
  const [stepError, setStepError] = useState('');
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [draftDeadline, setDraftDeadline] = useState('');
  const [draftSteps, setDraftSteps] = useState<{ id?: number; text: string }[]>([]);
  const [taskError, setTaskError] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);

  const isEditing = task !== null && editingTaskId === task.id;
  const isStepsExpanded = task !== null && collapsedStepsTaskId !== task.id;

  function startEditing() {
    if (!task) return;
    setDraftDeadline(task.deadline);
    setDraftSteps(task.steps.map(({ id, text }) => ({ id, text })));
    setTaskError('');
    onStartEditing(task);
  }

  function cancelEditing() {
    onStopEditing();
    setTaskError('');
  }

  async function saveTaskEdits() {
    if (!task || isSavingTask) return;
    const title = draftTitle.trim();
    const steps = draftSteps.map((step) => ({ ...step, text: step.text.trim() }));

    if (!title) {
      setTaskError('Task name is required.');
      return;
    }
    if (!draftDeadline) {
      setTaskError('A deadline is required.');
      return;
    }
    if (steps.length > 9) {
      setTaskError('A task can have at most 9 steps.');
      return;
    }
    if (steps.some((step) => !step.text)) {
      setTaskError('Step names cannot be empty. Remove an empty step or enter a name.');
      return;
    }

    setIsSavingTask(true);
    setTaskError('');
    try {
      await onSaveTask(task.id, { title, deadline: draftDeadline, steps });
      onStopEditing();
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : 'Could not save task.');
    } finally {
      setIsSavingTask(false);
    }
  }

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

  const addStepButton = task && task.steps.length < 9 && addingTaskId !== task.id && (
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
  );

  return (
    <WingPanel
      action={
        task && !isEditing ? (
          <Button
            type="primary"
            shape="circle"
            aria-label="Edit task"
            title="Edit task"
            icon={<EditOutlined style={{ fontSize: 20 }} />}
            style={{
              width: 40,
              height: 40,
              backgroundColor: palette.steelBlue,
              color: '#fff',
              border: 'none',
              boxShadow: 'none',
            }}
            onClick={startEditing}
          />
        ) : null
      }
    >
    <Card
      className="h-full"
      style={{
        backgroundColor: palette.swallowtailYellow,
        border: 'none',
        borderRadius: 16,
      }}
      classNames={{ body: 'wheel-scroll' }}
      styles={{ body: { height: '100%', padding: 0, paddingLeft: 48, overflowY: 'auto' } }}
    >
      {task ? (
        <div>
          <div className="flex h-[70px] items-center justify-between gap-3 pl-6 pr-16">
            {isEditing ? (
              <Input
                type="date"
                aria-label="Task deadline"
                value={draftDeadline}
                disabled={isSavingTask}
                onChange={(event) => setDraftDeadline(event.target.value)}
              />
            ) : task.steps.length > 0 ? (
              <button
                type="button"
                aria-expanded={isStepsExpanded}
                aria-controls={`task-steps-${task.id}`}
                className="flex items-center gap-3 text-left"
                style={{ color: palette.charcoal, fontSize: 21, fontWeight: 600 }}
                onClick={() => setCollapsedStepsTaskId(isStepsExpanded ? task.id : null)}
              >
                {isStepsExpanded ? <DownOutlined /> : <RightOutlined />}
                <span>Steps ({task.steps.length})</span>
              </button>
            ) : null}
            {!isEditing && task.steps.length > 0 && <div className="-ml-1 mr-auto">{addStepButton}</div>}
            {!isEditing && (
              <div className="ml-auto">
                <DateBadge date={task.deadline} />
              </div>
            )}
            <div className="flex shrink-0 items-center gap-1">
              {isEditing ? (
                <>
                  <Button type="primary" icon={<SaveOutlined />} disabled={isSavingTask} onClick={saveTaskEdits}>
                    Save
                  </Button>
                  <Button type="text" disabled={isSavingTask} onClick={cancelEditing}>
                    Cancel
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3 pb-6 pl-6 pr-24">
              {draftSteps.length > 0 ? (
                <section>
                  <div className="py-2" style={{ color: palette.charcoal, fontSize: 21, fontWeight: 600 }}>
                    Steps ({draftSteps.length})
                  </div>
                  <div className="space-y-2">
                    {draftSteps.map((step, index) => (
                      <div key={step.id ?? `new-step-${index}`} className="flex items-center gap-2">
                        <Input
                          aria-label={`Step ${index + 1} name`}
                          value={step.text}
                          disabled={isSavingTask}
                          onChange={(event) =>
                            setDraftSteps((previous) =>
                              previous.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, text: event.target.value } : item,
                              ),
                            )
                          }
                        />
                        <Button
                          type="text"
                          aria-label={`Remove step ${index + 1}`}
                          icon={<DeleteOutlined />}
                          disabled={isSavingTask}
                          style={{ color: palette.charcoal }}
                          onClick={() =>
                            setDraftSteps((previous) => previous.filter((_, itemIndex) => itemIndex !== index))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <p className="m-0" style={{ color: palette.charcoal, fontSize: 18, fontWeight: 600 }}>
                  No steps for this task.
                </p>
              )}
              {draftSteps.length < 9 && (
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  disabled={isSavingTask}
                  style={{ color: palette.charcoal }}
                  onClick={() => setDraftSteps((previous) => [...previous, { text: '' }])}
                >
                  Add step
                </Button>
              )}
              {taskError && <Alert type="error" showIcon message={taskError} />}
            </div>
          ) : (
            <div className="pl-6 pr-24">
              {task.steps.length > 0 ? (
                <section>
                  {isStepsExpanded && (
                    <div id={`task-steps-${task.id}`}>
                      <StepWheel steps={task.steps} onToggleStep={onToggleStep} />
                      {addingTaskId === task.id && stepInput}
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
                    onClick={startAddingStep}
                  >
                    Add a step.
                  </Button>
                </div>
              )}
              {task.steps.length === 0 && addingTaskId === task.id && stepInput}
              {stepError && <Alert className="mt-2" type="error" showIcon message={stepError} />}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="m-0" style={{ color: palette.charcoal, fontSize: 18, fontWeight: 600 }}>
            No task selected.
          </p>
        </div>
      )}
    </Card>
    </WingPanel>
  );
}
