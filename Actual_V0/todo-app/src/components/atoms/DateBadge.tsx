import { Tag } from 'antd';

interface DateBadgeProps {
  date: string; // ISO date string, e.g. "2026-10-20"
}

export default function DateBadge({ date }: DateBadgeProps) {
  const formatted = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const isOverdue = new Date(date + 'T00:00:00') < new Date(new Date().toDateString());

  return <Tag color={isOverdue ? 'red' : 'default'}>{formatted}</Tag>;
}
