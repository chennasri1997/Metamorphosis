import { Card, Listy } from 'antd';
import TaskListRow from '@/components/molecules/TaskListRow';
import type { Task } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: number | null;
  onSelectTask: (taskId: number) => void;
  onSelectedRowElement?: (el: HTMLDivElement | null) => void;
}

export default function TaskList({ tasks, selectedTaskId, onSelectTask, onSelectedRowElement }: TaskListProps) {
  const activeTasks = tasks.filter((task) => !task.completed);

  return (
    <Card title="My Tasks" className="h-full" styles={{ body: { padding: 0 } }}>
      <Listy
        items={activeTasks}
        rowKey="id"
        itemRender={(task) => (
          <TaskListRow
            title={task.title}
            selected={task.id === selectedTaskId}
            onClick={() => onSelectTask(task.id)}
            rowRef={task.id === selectedTaskId ? onSelectedRowElement : undefined}
          />
        )}
      />
    </Card>
  );
}
