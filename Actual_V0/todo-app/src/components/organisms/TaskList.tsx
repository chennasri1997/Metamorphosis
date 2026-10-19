import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Input, Listy } from 'antd';
import { useState } from 'react';
import TaskListRow from '@/components/molecules/TaskListRow';
import { palette } from '@/lib/theme';
import type { Task } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: number | null;
  onSelectTask: (taskId: number) => void;
  onSelectedRowElement?: (el: HTMLDivElement | null) => void;
  onToggleComplete: (taskId: number, completed: boolean) => void;
  canAddTask: boolean;
  onCreateTask: (title: string) => Promise<void>;
  loadError: string;
}

export default function TaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
  onSelectedRowElement,
  onToggleComplete,
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
    <Card
      title={
        <span style={{ display: 'block', color: '#FFFFFF', fontSize: 24, fontWeight: 600, textAlign: 'center' }}>
          My Tasks ({activeTasks.length})
        </span>
      }
      className=""
      style={{ borderBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
      styles={{
        header: { backgroundColor: palette.warmUmber, color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' },
        body: {
          backgroundColor: palette.warmUmberLight,
          color: palette.charcoal,
          padding: 0,
          borderRadius: 0,
        },
      }}
    >
      <Listy
        items={activeTasks}
        rowKey="id"
        itemRender={(task) => (
          <TaskListRow
            title={task.title}
            selected={task.id === selectedTaskId}
            completed={task.completed}
            onToggleComplete={(completed) => onToggleComplete(task.id, completed)}
            onClick={() => onSelectTask(task.id)}
            rowRef={task.id === selectedTaskId ? onSelectedRowElement : undefined}
          />
        )}
      />
      {loadError && <Alert type="error" showIcon message={loadError} />}
      {isAdding ? (
        <form onSubmit={submitNewTask} className="flex items-center gap-2 px-4 py-3">
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
      ) : (
        activeTasks.length === 0 ? (
          <div className="flex flex-wrap items-center gap-x-2 px-4 py-3">
            <p className="m-0" style={{ color: palette.charcoal, fontSize: 18, fontWeight: 600 }}>
              No active tasks.
            </p>
            <Button
              type="text"
              disabled={!canAddTask}
              title={canAddTask ? 'Add a task' : 'Maximum of 9 tasks reached'}
              style={{ padding: 0, height: 'auto', color: palette.steelBlue, fontSize: 18, fontWeight: 600 }}
              onClick={() => setIsAdding(true)}
            >
              Add a task.
            </Button>
          </div>
        ) : (
          <div className="flex justify-center py-3">
            <Button
              type="primary"
              shape="circle"
              aria-label="Add task"
              title={canAddTask ? 'Add task' : 'Maximum of 9 tasks reached'}
              icon={<PlusOutlined style={{ fontSize: 21, fontWeight: 600 }} />}
              disabled={!canAddTask}
              style={{
                width: 40,
                height: 40,
                backgroundColor: palette.swallowtailYellow,
                borderColor: palette.swallowtailYellow,
                color: palette.charcoal,
              }}
              onClick={() => setIsAdding(true)}
            />
          </div>
        )
      )}
      {saveError && <div role="alert" className="px-4 pb-3 text-sm text-red-700">{saveError}</div>}
    </Card>
  );
}
