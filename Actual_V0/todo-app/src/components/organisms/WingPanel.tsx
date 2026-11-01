'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ROW_HEIGHT } from '@/components/organisms/TaskWheel';
import { WING_DEPTH } from '@/components/organisms/WingShape';

const CORNER = 18;
const SAMPLE_STEP = 4;

// The left edge bows out to meet the wing's tip at the selected row's center line,
// mirroring the wing's right edge; past the arc it runs straight.
// The right edge mirrors the wing's left edge: a notch WING_DEPTH deep at the center line.
function buildPanelPath(width: number, height: number, center: number, half: number): string {
  const inset = (y: number) => {
    const t = Math.min(Math.abs(y - center) / half, 1);
    return WING_DEPTH * t * t;
  };
  const rightInset = (y: number) => WING_DEPTH - inset(y);
  const slopeAt = (y: number) => {
    const t = Math.abs(y - center) / half;
    return t >= 1 ? 0 : (2 * WING_DEPTH * t) / half;
  };
  const yStart = CORNER;
  const yEnd = height - CORNER;
  const left: string[] = [];
  const right: string[] = [];
  for (let y = yStart; y <= yEnd; y += SAMPLE_STEP) {
    left.push(`L ${inset(y).toFixed(2)} ${y}`);
    right.push(`L ${(width - rightInset(y)).toFixed(2)} ${y}`);
  }
  const top = inset(0);
  const bottom = inset(height);
  const rTop = rightInset(0);
  const rBottom = rightInset(height);
  const rTopControl = rightInset(yStart) - slopeAt(yStart) * CORNER;
  const rBottomControl = rightInset(yEnd) - slopeAt(yEnd) * CORNER;

  return [
    `M ${top + CORNER} 0`,
    `L ${width - rTop - CORNER} 0`,
    `Q ${width - rTopControl} 0 ${width - rightInset(yStart)} ${yStart}`,
    ...right,
    `L ${width - rightInset(yEnd)} ${yEnd}`,
    `Q ${width - rBottomControl} ${height} ${width - rBottom - CORNER} ${height}`,
    `L ${bottom + CORNER} ${height}`,
    `Q ${bottom} ${height} ${inset(yEnd)} ${yEnd}`,
    ...left.reverse(),
    `L ${inset(yStart)} ${yStart}`,
    `Q ${top} 0 ${top + CORNER} 0 Z`,
  ].join(' ');
}

export default function WingPanel({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clipPath, setClipPath] = useState<string>();
  const [tipY, setTipY] = useState<number | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const wing = container.closest('main')?.querySelector<HTMLElement>('[data-wing-root]');

    const update = () => {
      const wheel = wing?.querySelector<HTMLElement>('[data-wing="wheel"]');
      const bounds = container.getBoundingClientRect();
      const width = Math.round(bounds.width * 100) / 100;
      const height = Math.round(bounds.height * 100) / 100;
      if (!wing || !wheel || width <= WING_DEPTH + CORNER * 2 || height <= CORNER * 2) {
        setClipPath(undefined);
        return;
      }

      const wingBounds = wing.getBoundingClientRect();
      const wheelTop = wheel.getBoundingClientRect().top;
      const wingCenter = wheelTop - wingBounds.top + ROW_HEIGHT * 1.5;
      const half = Math.max(Math.min(wingCenter, wingBounds.height - wingCenter), CORNER);
      const center = wheelTop - bounds.top + ROW_HEIGHT * 1.5;
      setTipY(center);
      container.dataset.wingCenter = String(center);
      container.dataset.wingHalf = String(half);
      container.dispatchEvent(new Event('wing-panel-update'));

      setClipPath(`path('${buildPanelPath(width, height, center, half)}')`);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    if (wing) observer.observe(wing);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="group relative h-full">
      <div ref={containerRef} data-wing-panel className="h-full" style={{ clipPath }}>
        {children}
      </div>
      {action && tipY !== null && (
        <div
          className="absolute opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
          style={{ right: 16, top: tipY - 20 }}
        >
          {action}
        </div>
      )}
    </div>
  );
}
