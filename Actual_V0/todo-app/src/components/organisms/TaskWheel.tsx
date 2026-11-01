'use client';

import { useEffect, useRef, useState } from 'react';
import TaskListRow from '@/components/molecules/TaskListRow';
import { palette } from '@/lib/theme';
import type { Task } from '@/lib/types';

export const ROW_HEIGHT = 76;
const VISIBLE_ROWS = 3;

interface TaskWheelProps {
  tasks: Task[];
  selectedTaskId: number | null;
  onSelectTask: (taskId: number) => void;
  onToggleComplete: (taskId: number, completed: boolean) => void;
  editingTaskId: number | null;
  draftTitle: string;
  onDraftTitleChange: (title: string) => void;
  onCancelEdit: () => void;
}

export default function TaskWheel({
  tasks,
  selectedTaskId,
  onSelectTask,
  onToggleComplete,
  editingTaskId,
  draftTitle,
  onDraftTitleChange,
  onCancelEdit,
}: TaskWheelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const targetIndexRef = useRef<number | null>(null);
  const targetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ startY: number; startTop: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const selectedIndex = tasks.findIndex((task) => task.id === selectedTaskId);
  const centerIndex = Math.min(Math.max(Math.round(position), 0), tasks.length - 1);

  function scrollToIndex(index: number) {
    const el = scrollRef.current;
    if (!el) return;
    targetIndexRef.current = index;
    if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
    targetTimerRef.current = setTimeout(() => {
      targetIndexRef.current = null;
    }, 700);
    el.scrollTo({ top: index * ROW_HEIGHT, behavior: 'smooth' });
  }

  // Bring the selected task to the middle when selection changes from outside the wheel.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || selectedIndex < 0) return;
    if (Math.round(el.scrollTop / ROW_HEIGHT) !== selectedIndex) scrollToIndex(selectedIndex);
  }, [selectedIndex, tasks.length]);

  useEffect(
    () => () => {
      if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
    },
    [],
  );

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const next = el.scrollTop / ROW_HEIGHT;
    setPosition(next);

    if (targetIndexRef.current !== null) {
      if (Math.abs(el.scrollTop - targetIndexRef.current * ROW_HEIGHT) < 2) targetIndexRef.current = null;
      return;
    }
    const index = Math.min(Math.max(Math.round(next), 0), tasks.length - 1);
    const task = tasks[index];
    if (task && task.id !== selectedTaskId) onSelectTask(task.id);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el || event.pointerType !== 'mouse' || event.button !== 0) return;
    if ((event.target as HTMLElement).closest('input, button, label')) return;

    dragRef.current = { startY: event.clientY, startTop: el.scrollTop, moved: false };
    suppressClickRef.current = false;

    const handleMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = moveEvent.clientY - drag.startY;
      if (!drag.moved && Math.abs(delta) > 4) {
        drag.moved = true;
        setIsDragging(true);
      }
      if (drag.moved) el.scrollTop = drag.startTop - delta;
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag?.moved) return;
      suppressClickRef.current = true;
      setIsDragging(false);
      scrollToIndex(Math.min(Math.max(Math.round(el.scrollTop / ROW_HEIGHT), 0), tasks.length - 1));
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).tagName === 'INPUT') return;
    const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = tasks[Math.min(Math.max(centerIndex + step, 0), tasks.length - 1)];
    if (next) onSelectTask(next.id);
  }

  return (
    <div
      ref={scrollRef}
      role="listbox"
      aria-label="Tasks"
      data-wing="wheel"
      tabIndex={0}
      className="wheel-scroll"
      onScroll={handleScroll}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onClickCapture={(event) => {
        if (suppressClickRef.current) {
          event.stopPropagation();
          suppressClickRef.current = false;
        }
      }}
      style={{
        height: ROW_HEIGHT * VISIBLE_ROWS,
        overflowY: 'auto',
        scrollSnapType: isDragging ? 'none' : 'y mandatory',
        cursor: isDragging ? 'grabbing' : undefined,
        userSelect: isDragging ? 'none' : undefined,
        outline: 'none',
      }}
    >
      <WheelFiller />
      {tasks.map((task, index) => {
        const isCenter = index === centerIndex;
        return (
          <div
            key={task.id}
            role="option"
            aria-selected={isCenter}
            style={{ height: ROW_HEIGHT, scrollSnapAlign: 'center' }}
          >
            <TaskListRow
              title={task.title}
              deadline={task.deadline}
              stepCount={task.steps.length}
              selected={isCenter}
              completed={task.completed}
              showCheckbox={isCenter}
              isEditingTitle={isCenter && task.id === editingTaskId}
              draftTitle={draftTitle}
              onDraftTitleChange={onDraftTitleChange}
              onCancelEdit={onCancelEdit}
              onToggleComplete={(completed) => onToggleComplete(task.id, completed)}
              onClick={() => onSelectTask(task.id)}
              style={{
                height: '100%',
                width: 'auto',
                borderRadius: 0,
                paddingLeft: 96,
                paddingRight: 48,
              }}
            />
          </div>
        );
      })}
      <WheelFiller />
    </div>
  );
}

// Blank slot above the first / below the last task so the stack has no gaps.
function WheelFiller() {
  return (
    <div aria-hidden style={{ height: ROW_HEIGHT, backgroundColor: palette.warmPaleYellow }} />
  );
}
