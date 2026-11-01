'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ROW_HEIGHT } from '@/components/organisms/TaskWheel';

const CORNER = 18;
const SAMPLE_STEP = 4;
export const WING_DEPTH = 72;

// Both edges follow one parabola mirrored about the selected row's center line:
// the left edge is inset WING_DEPTH at the tip and 0 at the ends, the right edge
// is inset 0 at the tip and WING_DEPTH at the ends. Past the arc the edges run straight.
function insets(y: number, center: number, half: number) {
  const t = Math.min(Math.abs(y - center) / half, 1);
  return { left: WING_DEPTH * (1 - t * t), right: WING_DEPTH * t * t };
}

function buildWingPath(width: number, height: number, center: number, half: number): string {
  const yStart = CORNER;
  const yEnd = height - CORNER;
  const right: string[] = [];
  const left: string[] = [];

  for (let y = yStart; y <= yEnd; y += SAMPLE_STEP) {
    const inset = insets(y, center, half);
    right.push(`${(width - inset.right).toFixed(2)} ${y}`);
    left.push(`${inset.left.toFixed(2)} ${y}`);
  }
  const first = insets(yStart, center, half);
  const last = insets(yEnd, center, half);
  const topLeft = insets(0, center, half).left;
  const topRight = width - insets(0, center, half).right;
  const bottomLeft = insets(height, center, half).left;
  const bottomRight = width - insets(height, center, half).right;
  // Left corners curve along the arc's tangent so the edge flows into them without a hook.
  const slopeAt = (y: number) => {
    const t = Math.abs(y - center) / half;
    return t >= 1 ? 0 : (2 * WING_DEPTH * t) / half;
  };
  const topControl = first.left - slopeAt(yStart) * CORNER;
  const bottomControl = last.left - slopeAt(yEnd) * CORNER;

  return [
    `M ${topLeft + CORNER} 0`,
    `L ${topRight - CORNER} 0`,
    `Q ${topRight} 0 ${width - first.right} ${yStart}`,
    ...right.map((p) => `L ${p}`),
    `L ${width - last.right} ${yEnd}`,
    `Q ${bottomRight} ${height} ${bottomRight - CORNER} ${height}`,
    `L ${bottomLeft + CORNER} ${height}`,
    `Q ${bottomControl} ${height} ${last.left} ${yEnd}`,
    ...left.reverse().map((p) => `L ${p}`),
    `L ${first.left} ${yStart}`,
    `Q ${topControl} 0 ${topLeft + CORNER} 0 Z`,
  ].join(' ');
}

export default function WingShape({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clipPath, setClipPath] = useState<string>();
  const [tipY, setTipY] = useState<number | null>(null);
  const [bandHovered, setBandHovered] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const bounds = container.getBoundingClientRect();
      const width = Math.round(bounds.width * 100) / 100;
      const height = Math.round(bounds.height * 100) / 100;
      if (width <= WING_DEPTH + CORNER * 2 || height <= CORNER * 2) {
        setClipPath(undefined);
        return;
      }

      const wheel = container.querySelector('[data-wing="wheel"]');
      const center = wheel
        ? wheel.getBoundingClientRect().top - bounds.top + ROW_HEIGHT * 1.5
        : height / 2;
      setTipY(wheel ? center : null);
      // The arc spans from the top of the section to the point mirrored below the tip.
      const half = Math.max(Math.min(center, height - center), CORNER);

      // Shift titles so they sit in the middle of the visible band between the curved edges.
      container.querySelectorAll<HTMLElement>('[data-wing="header"], [data-wing="completed"]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const y = rect.top - bounds.top + rect.height / 2;
        const t = Math.min(Math.abs(y - center) / half, 1);
        el.style.setProperty('--wing-shift', `${(WING_DEPTH / 2 - WING_DEPTH * t * t).toFixed(2)}px`);
      });

      setClipPath(`path('${buildWingPath(width, height, center, half)}')`);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    container.querySelectorAll('[data-wing]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Hovering anywhere along the selected row's band reveals the action in the notch.
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (tipY === null) return;
    const top = event.currentTarget.getBoundingClientRect().top;
    setBandHovered(Math.abs(event.clientY - top - tipY) <= ROW_HEIGHT / 2);
  };

  return (
    <div
      className="group relative"
      data-hovered={bandHovered}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setBandHovered(false)}
    >
      <div ref={containerRef} data-wing-root style={{ clipPath }}>
        {children}
      </div>
      {action && tipY !== null && (
        <div className="absolute" style={{ left: 16, top: tipY - 20 }}>
          {action}
        </div>
      )}
    </div>
  );
}
