import { Checkbox, Input } from 'antd';
import type { CSSProperties } from 'react';
import DateBadge from '@/components/atoms/DateBadge';
import { palette } from '@/lib/theme';

interface TaskListRowProps {
  title: string;
  deadline: string;
  stepCount: number;
  selected: boolean;
  completed: boolean;
  isEditingTitle?: boolean;
  draftTitle?: string;
  onDraftTitleChange?: (title: string) => void;
  onCancelEdit?: () => void;
  onToggleComplete: (completed: boolean) => void;
  onClick?: () => void;
  showCheckbox?: boolean;
  style?: CSSProperties;
}

export default function TaskListRow({
  title,
  deadline,
  stepCount,
  selected,
  completed,
  isEditingTitle = false,
  draftTitle = '',
  onDraftTitleChange,
  onCancelEdit,
  onToggleComplete,
  onClick,
  showCheckbox = true,
  style,
}: TaskListRowProps) {
  return (
    <div
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-5 py-3 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        backgroundColor: selected ? palette.swallowtailYellow : palette.warmPaleYellow,
        color: palette.charcoal,
        fontSize: selected ? 26 : 21,
        fontWeight: selected ? 700 : 400,
        ...style,
      }}
    >
      {showCheckbox && (
        <span onClick={(event) => event.stopPropagation()}>
          <Checkbox
            className="task-completion-checkbox"
            checked={completed}
            aria-label={`${completed ? 'Reopen' : 'Complete'} ${title}`}
            onChange={(event) => onToggleComplete(event.target.checked)}
          />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={isEditingTitle ? 'block' : completed ? 'line-through opacity-60' : 'truncate'}>
          {isEditingTitle ? (
            <Input
              autoFocus
              aria-label="Task title"
              value={draftTitle}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => onDraftTitleChange?.(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') onCancelEdit?.();
              }}
              style={{ fontSize: 24, fontWeight: 700 }}
            />
          ) : (
            title
          )}
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
