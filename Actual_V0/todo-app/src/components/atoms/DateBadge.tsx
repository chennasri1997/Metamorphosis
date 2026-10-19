import { Tag } from 'antd';
import { palette } from '@/lib/theme';

interface DateBadgeProps {
  date: string; // ISO date string, e.g. "2026-10-20"
}

export default function DateBadge({ date }: DateBadgeProps) {
  const formatted = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isOverdue = new Date(date + 'T00:00:00') < new Date(new Date().toDateString());

  return (
    <Tag
      style={{
        backgroundColor: 'transparent',
        border: 'none',
        color: isOverdue ? palette.redOrange : palette.charcoal,
        fontSize: 24,
        fontWeight: 600,
        lineHeight: 1.2,
        padding: 0,
        marginInlineEnd: 0,
      }}
    >
      {formatted}
    </Tag>
  );
}
