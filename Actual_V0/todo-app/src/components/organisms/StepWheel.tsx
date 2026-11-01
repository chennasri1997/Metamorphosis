'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import StepRow from '@/components/molecules/StepRow';
import { WING_DEPTH } from '@/components/organisms/WingShape';
import type { Task } from '@/lib/types';

export const STEP_ROW_HEIGHT = 48;

interface ArcWheelProps {
  label: string;
  visibleRows: number;
  rowCount: number;
  children: ReactNode;
}

// Snap-scrolling list whose rows (marked data-step-row) are pushed right by the
// panel's left-edge arc so the list follows its curve.
export function ArcWheel({ label, visibleRows, rowCount, children }: ArcWheelProps) {
  const listRef = useRef<HTMLUListElement>(null);

  const applyArc = useCallback(() => {
    const list = listRef.current;
    const panel = list?.closest<HTMLElement>('[data-wing-panel]');
    if (!list || !panel) return;
    const center = Number(panel.dataset.wingCenter);
    const half = Number(panel.dataset.wingHalf);
    if (!center || !half) return;
    const panelTop = panel.getBoundingClientRect().top;
    list.querySelectorAll<HTMLElement>('[data-step-row]').forEach((row) => {
      const rect = row.getBoundingClientRect();
      const y = rect.top - panelTop + rect.height / 2;
      const t = Math.min(Math.abs(y - center) / half, 1);
      row.style.paddingLeft = `${(WING_DEPTH * t * t).toFixed(1)}px`;
    });
  }, []);

  useLayoutEffect(() => {
    applyArc();
    const panel = listRef.current?.closest<HTMLElement>('[data-wing-panel]');
    panel?.addEventListener('wing-panel-update', applyArc);
    return () => panel?.removeEventListener('wing-panel-update', applyArc);
  }, [applyArc, rowCount]);

  return (
    <ul
      ref={listRef}
      aria-label={label}
      className="wheel-scroll m-0 p-0"
      onScroll={applyArc}
      style={{
        height: STEP_ROW_HEIGHT * visibleRows,
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        listStyle: 'none',
      }}
    >
      {children}
      <li aria-hidden style={{ height: STEP_ROW_HEIGHT * (visibleRows - 1) }} />
    </ul>
  );
}

interface StepWheelProps {
  steps: Task['steps'];
  onToggleStep: (stepId: number, completed: boolean) => void;
}

// Only the first step is emphasized.
export default function StepWheel({ steps, onToggleStep }: StepWheelProps) {
  return (
    <ArcWheel label="Steps" visibleRows={6} rowCount={steps.length}>
      {steps.map((step, index) => (
        <StepRow
          key={step.id}
          text={step.text}
          completed={step.completed}
          onToggle={(completed) => onToggleStep(step.id, completed)}
          isFirst={index === 0}
          style={{ height: STEP_ROW_HEIGHT, scrollSnapAlign: 'start' }}
        />
      ))}
    </ArcWheel>
  );
}
