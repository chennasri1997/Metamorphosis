import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  RightOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Input, Popover } from 'antd';
import { useState } from 'react';
import DateBadge from '@/components/atoms/DateBadge';
import RepeatSelect from '@/components/molecules/RepeatSelect';
import StepWheel, { ArcWheel, STEP_ROW_HEIGHT } from '@/components/organisms/StepWheel';
import WingPanel from '@/components/organisms/WingPanel';
import { palette } from '@/lib/theme';
import type { Repeat, Task } from '@/lib/types';

interface TaskViewProps {
  task: Task | null;
  onToggleStep: (stepId: number, completed: boolean) => void;
  onAddStep: (taskId: number, text: string) => Promise<void>;
  onSaveTask: (
    taskId: number,
    updates: { title: string; deadline: string; repeat: Repeat; steps: { id?: number; text: string }[] },
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
  const [draftRepeat, setDraftRepeat] = useState<Repeat>('never');
  const [draftSteps, setDraftSteps] = useState<{ id?: number; text: string }[]>([]);
  const [taskError, setTaskError] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);

  const isEditing = task !== null && editingTaskId === task.id;
  const isStepsExpanded = task !== null && collapsedStepsTaskId !== task.id;

  function startEditing() {
    if (!task) return;
    setDraftDeadline(task.deadline);
    setDraftRepeat(task.repeat);
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
      await onSaveTask(task.id, { title, deadline: draftDeadline, repeat: draftRepeat, steps });
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
    if (isSavingStep) return;
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

  // The add-step form floats below its trigger so the panel's layout never changes.
  const withStepPopover = (trigger: React.ReactElement) =>
    task && (
      <Popover
        open={addingTaskId === task.id}
        placement="bottomLeft"
        trigger="click"
        onOpenChange={(open) => (open ? startAddingStep() : cancelStep())}
        content={
          <form onSubmit={submitStep} className="flex w-64 flex-col gap-2">
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
            {stepError && (
              <div role="alert" className="text-sm" style={{ color: palette.redOrange }}>
                {stepError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button size="small" htmlType="button" disabled={isSavingStep} onClick={cancelStep}>
                Cancel
              </Button>
              <Button size="small" type="primary" htmlType="submit" loading={isSavingStep} disabled={!stepText.trim()}>
                Add
              </Button>
            </div>
          </form>
        }
      >
        {trigger}
      </Popover>
    );

  const addStepButton =
    task &&
    task.steps.length < 9 &&
    withStepPopover(
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
      />,
    );

  return (
    <WingPanel
      alwaysShowAction={isEditing}
      action={
        task ? (
          <Button
            type="primary"
            shape="circle"
            aria-label={isEditing ? 'Save task' : 'Edit task'}
            title={isEditing ? 'Save task' : 'Edit task'}
            disabled={isSavingTask}
            icon={isEditing ? <SaveOutlined style={{ fontSize: 20 }} /> : <EditOutlined style={{ fontSize: 20 }} />}
            style={{
              width: 40,
              height: 40,
              backgroundColor: palette.steelBlue,
              color: '#fff',
              border: 'none',
              boxShadow: 'none',
            }}
            onClick={isEditing ? saveTaskEdits : startEditing}
          />
        ) : null
      }
    >
    <Card
      className="h-full"
      style={{
        backgroundColor: task ? palette.swallowtailYellow : palette.warmPaleYellow,
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
                  <Button type="text" disabled={isSavingTask} onClick={cancelEditing}>
                    Cancel
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          {isEditing ? (
            <div className="pb-6 pl-6 pr-24">
              {draftSteps.length > 0 ? (
                <section>
                  <div className="flex h-10 items-center gap-1" style={{ color: palette.charcoal, fontSize: 21, fontWeight: 600 }}>
                    <span>Steps ({draftSteps.length})</span>
                    {draftSteps.length < 9 && (
                      <Button
                        type="text"
                        aria-label="Add step"
                        title="Add step"
                        icon={<PlusOutlined style={{ fontSize: 21, fontWeight: 600 }} />}
                        disabled={isSavingTask}
                        style={{ width: 36, height: 36, padding: 0, color: palette.charcoal }}
                        onClick={() => setDraftSteps((previous) => [...previous, { text: '' }])}
                      />
                    )}
                  </div>
                  <ArcWheel label="Edit steps" visibleRows={4} rowCount={draftSteps.length}>
                    {draftSteps.map((step, index) => (
                      <li
                        key={step.id ?? `new-step-${index}`}
                        data-step-row=""
                        className="flex items-center gap-2"
                        style={{ height: STEP_ROW_HEIGHT, scrollSnapAlign: 'start' }}
                      >
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
                      </li>
                    ))}
                  </ArcWheel>
                </section>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="m-0" style={{ color: palette.charcoal, fontSize: 18, fontWeight: 600 }}>
                    No steps for this task.
                  </p>
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    disabled={isSavingTask}
                    style={{ color: palette.charcoal }}
                    onClick={() => setDraftSteps([{ text: '' }])}
                  >
                    Add step
                  </Button>
                </div>
              )}
              <div className="mt-2 flex h-10 items-center gap-3" style={{ color: palette.charcoal, fontSize: 18, fontWeight: 600 }}>
                <span>Repeat</span>
                <RepeatSelect className="w-40" value={draftRepeat} disabled={isSavingTask} onChange={setDraftRepeat} />
              </div>
              {taskError && <Alert className="mt-2" type="error" showIcon message={taskError} />}
            </div>
          ) : (
            <div className="pl-6 pr-24">
              {task.steps.length > 0 ? (
                <section>
                  {isStepsExpanded && (
                    <div id={`task-steps-${task.id}`}>
                      <StepWheel steps={task.steps} onToggleStep={onToggleStep} />
                    </div>
                  )}
                </section>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-x-2">
                  <p className="m-0" style={{ color: palette.charcoal, fontSize: 18, fontWeight: 600 }}>
                    No steps for this task.
                  </p>
                  {withStepPopover(
                    <Button
                      type="text"
                      style={{ padding: 0, height: 'auto', color: palette.steelBlue, fontSize: 18, fontWeight: 600 }}
                    >
                      Add a step.
                    </Button>,
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center pr-[48px]">
          <p className="m-0" style={{ color: palette.charcoal, fontSize: 18, fontWeight: 600 }}>
            Create a task to get started.
          </p>
        </div>
      )}
    </Card>
    </WingPanel>
  );
}
