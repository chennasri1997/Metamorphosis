import { Tag } from 'antd';
import { palette } from '@/lib/theme';

interface DateBadgeProps {
  date: string; // ISO date string, e.g. "2026-10-20"
  compact?: boolean;
}

export default function DateBadge({ date, compact = false }: DateBadgeProps) {
  const formatted = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Tag
      style={{
        backgroundColor: compact ? 'transparent' : palette.redOrange,
        border: 'none',
        borderRadius: compact ? 0 : 999,
        color: compact ? palette.charcoal : '#FFFFFF',
        fontSize: compact ? 16 : 21,
        fontWeight: 600,
        lineHeight: 1.2,
        padding: compact ? 0 : '3px 9px',
        marginInlineEnd: 0,
      }}
    >
      {formatted}
    </Tag>
  );
}
