import TaskListRow from '@/components/molecules/TaskListRow';
import type { Task } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: number | null;
  onSelectTask: (taskId: number) => void;
}

export default function TaskList({ tasks, selectedTaskId, onSelectTask }: TaskListProps) {
  const activeTasks = tasks.filter((task) => !task.completed);

  return (
    <div className="h-full rounded-lg border border-neutral-300 bg-white">
      <h2 className="px-4 py-3 font-semibold border-b border-neutral-200">My Tasks</h2>
      <ul>
        {activeTasks.map((task) => (
          <TaskListRow
            key={task.id}
            title={task.title}
            selected={task.id === selectedTaskId}
            onClick={() => onSelectTask(task.id)}
          />
        ))}
      </ul>
    </div>
  );
}
