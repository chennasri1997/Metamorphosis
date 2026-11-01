'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import StepRow from '@/components/molecules/StepRow';
import { WING_DEPTH } from '@/components/organisms/WingShape';
import type { Task } from '@/lib/types';

const STEP_ROW_HEIGHT = 48;
const VISIBLE_STEPS = 6;

interface StepWheelProps {
  steps: Task['steps'];
  onToggleStep: (stepId: number, completed: boolean) => void;
}

// Snap-scrolling list; only the first step is emphasized.
// Rows are pushed right by the panel's left-edge arc so the list follows its curve.
export default function StepWheel({ steps, onToggleStep }: StepWheelProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState(0);

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
  }, [applyArc, steps.length]);

  useEffect(() => {
    applyArc();
  }, [applyArc, position]);

  return (
    <ul
      ref={listRef}
      aria-label="Steps"
      className="wheel-scroll m-0 p-0"
      onScroll={(event) => setPosition(event.currentTarget.scrollTop)}
      style={{
        height: STEP_ROW_HEIGHT * VISIBLE_STEPS,
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        listStyle: 'none',
      }}
    >
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
      <li aria-hidden style={{ height: STEP_ROW_HEIGHT * (VISIBLE_STEPS - 1) }} />
    </ul>
  );
}
