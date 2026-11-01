'use client';

import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { useState } from 'react';
import TaskListRow from '@/components/molecules/TaskListRow';
import { palette } from '@/lib/theme';
import type { Task } from '@/lib/types';

interface CompletedTaskSectionProps {
  tasks: Task[];
  onToggleComplete: (taskId: number, completed: boolean) => void;
}

export default function CompletedTaskSection({ tasks, onToggleComplete }: CompletedTaskSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="completed-task-list"
        className="relative flex w-full items-center gap-3 text-left"
        data-wing="completed"
        style={{
          backgroundColor: palette.charcoal,
          height: 70,
          padding: '0 104px 0 48px',
          color: '#FFFFFF',
          fontSize: 21,
          fontWeight: 600,
        }}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span
          className="pointer-events-none absolute inset-x-0 flex items-center justify-center"
          style={{ transform: 'translateX(var(--wing-shift, 0px))', gap: 9 }}
        >
          {isOpen ? <DownOutlined /> : <RightOutlined />}
          <span>Completed ({tasks.length})</span>
        </span>
      </button>
      {isOpen && (
        <div id="completed-task-list" className="flex flex-col">
          {tasks.map((task) => (
            <TaskListRow
              key={task.id}
              title={task.title}
              deadline={task.deadline}
              stepCount={task.steps.length}
              selected={false}
              completed
              onToggleComplete={(completed) => onToggleComplete(task.id, completed)}
              style={{ borderRadius: 0, paddingLeft: 48, paddingRight: 104 }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
