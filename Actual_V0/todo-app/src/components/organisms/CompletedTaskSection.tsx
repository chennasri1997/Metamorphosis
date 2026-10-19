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
    <section
      className="mt-0 overflow-hidden rounded-b-md rounded-t-none border-x border-b border-t-0"
      style={{ backgroundColor: palette.warmUmberPale, borderColor: palette.warmUmberPale }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="completed-task-list"
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        style={{ color: palette.charcoal, fontSize: 21, fontWeight: 600 }}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <DownOutlined /> : <RightOutlined />}
        <span>Completed ({tasks.length})</span>
      </button>
      {isOpen && (
        <div id="completed-task-list" className="border-t border-black/10 px-4 py-3">
          {tasks.map((task) => (
            <TaskListRow
              key={task.id}
              title={task.title}
              deadline={task.deadline}
              stepCount={task.steps.length}
              selected={false}
              completed
              onToggleComplete={(completed) => onToggleComplete(task.id, completed)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
