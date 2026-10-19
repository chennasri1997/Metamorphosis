import { BRIDGE_COLOR, palette } from '@/lib/theme';
import { Checkbox } from 'antd';

interface TaskListRowProps {
  title: string;
  selected: boolean;
  completed: boolean;
  onToggleComplete: (completed: boolean) => void;
  onClick?: () => void;
  rowRef?: (el: HTMLDivElement | null) => void;
}

export default function TaskListRow({
  title,
  selected,
  completed,
  onToggleComplete,
  onClick,
  rowRef,
}: TaskListRowProps) {
  return (
    <div
      ref={rowRef}
      onClick={onClick}
      className={`-mx-4 -my-3 flex items-center gap-3 px-4 py-3 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor: selected ? BRIDGE_COLOR : undefined,
        color: palette.charcoal,
        fontSize: 21,
        fontWeight: selected ? 600 : 400,
      }}
    >
      <span onClick={(event) => event.stopPropagation()}>
        <Checkbox
          className="task-completion-checkbox"
          checked={completed}
          aria-label={`${completed ? 'Reopen' : 'Complete'} ${title}`}
          onChange={(event) => onToggleComplete(event.target.checked)}
        />
      </span>
      <span className={completed ? 'line-through opacity-60' : ''}>{title}</span>
    </div>
  );
}
