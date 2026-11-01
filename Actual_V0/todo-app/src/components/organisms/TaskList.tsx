import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Input } from 'antd';
import { useState } from 'react';
import TaskWheel from '@/components/organisms/TaskWheel';
import { palette } from '@/lib/theme';
import type { Task } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: number | null;
  onSelectTask: (taskId: number) => void;
  onToggleComplete: (taskId: number, completed: boolean) => void;
  editingTaskId: number | null;
  draftTitle: string;
  onDraftTitleChange: (title: string) => void;
  onCancelEdit: () => void;
  canAddTask: boolean;
  onCreateTask: (title: string) => Promise<void>;
  loadError: string;
}

export default function TaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
  onToggleComplete,
  editingTaskId,
  draftTitle,
  onDraftTitleChange,
  onCancelEdit,
  canAddTask,
  onCreateTask,
  loadError,
}: TaskListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const activeTasks = tasks.filter((task) => !task.completed);

  async function submitNewTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title || isSaving) return;

    setIsSaving(true);
    setSaveError('');
    try {
      await onCreateTask(title);
      setNewTitle('');
      setIsAdding(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save task.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div
        data-wing="header"
        className="relative flex items-center justify-end"
        style={{
          backgroundColor: palette.charcoal,
          height: 70,
          padding: '0 76px 0 20px',
          color: '#FFFFFF',
          fontSize: 24,
          fontWeight: 600,
        }}
      >
        <span
          className="pointer-events-none absolute inset-x-0 text-center"
          style={{ transform: 'translateX(var(--wing-shift, 0px))' }}
        >
          My Tasks ({activeTasks.length})
        </span>
        <Button
          type="primary"
          shape="circle"
          aria-label="Add task"
          title={canAddTask ? 'Add task' : 'Maximum of 9 tasks reached'}
          icon={<PlusOutlined style={{ fontSize: 21, fontWeight: 600 }} />}
          disabled={!canAddTask || isAdding}
          style={{
            width: 40,
            height: 40,
            backgroundColor: palette.swallowtailYellow,
            color: palette.charcoal,
            border: 'none',
            boxShadow: 'none',
            cursor: !canAddTask || isAdding ? 'not-allowed' : 'pointer',
          }}
          onClick={() => setIsAdding(true)}
        />
      </div>
      {isAdding && (
        <form
          onSubmit={submitNewTask}
          className="flex items-center gap-2 py-3"
          style={{ backgroundColor: palette.warmPaleYellow, paddingLeft: 112, paddingRight: 88 }}
        >
          <Input
            autoFocus
            aria-label="New task name"
            placeholder="Task name"
            value={newTitle}
            disabled={isSaving}
            onChange={(event) => setNewTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setNewTitle('');
                setSaveError('');
                setIsAdding(false);
              }
            }}
          />
          <Button
            type="text"
            htmlType="button"
            aria-label="Cancel adding task"
            icon={<CloseOutlined />}
            disabled={isSaving}
            onClick={() => {
              setNewTitle('');
              setSaveError('');
              setIsAdding(false);
            }}
          />
        </form>
      )}
      {activeTasks.length > 0 ? (
        <TaskWheel
          tasks={activeTasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={onSelectTask}
          onToggleComplete={onToggleComplete}
          editingTaskId={editingTaskId}
          draftTitle={draftTitle}
          onDraftTitleChange={onDraftTitleChange}
          onCancelEdit={onCancelEdit}
        />
      ) : (
        !isAdding && (
          <div
            className="py-3"
            style={{
              backgroundColor: palette.warmPaleYellow,
              paddingLeft: 112,
              paddingRight: 88,
              color: palette.charcoal,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            No active tasks.
          </div>
        )
      )}
      {loadError && <Alert type="error" showIcon message={loadError} />}
      {saveError && <div role="alert" className="px-5 py-2 text-sm text-red-400">{saveError}</div>}
    </div>
  );
}
