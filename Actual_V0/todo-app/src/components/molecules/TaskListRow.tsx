import { palette } from '@/lib/theme';
import { Checkbox } from 'antd';
import type { CSSProperties } from 'react';
import DateBadge from '@/components/atoms/DateBadge';

interface TaskListRowProps {
  title: string;
  deadline: string;
  stepCount: number;
  selected: boolean;
  completed: boolean;
  onToggleComplete: (completed: boolean) => void;
  onClick?: () => void;
  rowRef?: (el: HTMLDivElement | null) => void;
  titleRef?: (el: HTMLSpanElement | null) => void;
  selectedGradient?: CSSProperties;
}

export default function TaskListRow({
  title,
  deadline,
  stepCount,
  selected,
  completed,
  onToggleComplete,
  onClick,
  rowRef,
  titleRef,
  selectedGradient,
}: TaskListRowProps) {
  return (
    <div
      ref={rowRef}
      onClick={onClick}
      className={`-mx-4 -my-3 flex items-center gap-3 px-4 py-3 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor: selected ? palette.swallowtailYellow : undefined,
        ...(selected ? selectedGradient : undefined),
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
      <span className="flex min-w-0 flex-1 flex-col">
        <span ref={titleRef} className={completed ? 'line-through opacity-60' : ''}>
          {title}
        </span>
        {!selected && (
          <span style={{ color: palette.charcoal, fontSize: 14, fontWeight: 400, opacity: 0.72 }}>
            {stepCount} {stepCount === 1 ? 'step' : 'steps'}
          </span>
        )}
      </span>
      {!selected && (
        <span className="shrink-0">
          <DateBadge date={deadline} compact />
        </span>
      )}
    </div>
  );
}
