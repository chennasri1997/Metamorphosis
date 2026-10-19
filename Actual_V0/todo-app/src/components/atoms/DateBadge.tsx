interface DateBadgeProps {
  date: string; // ISO date string, e.g. "2026-10-20"
}

export default function DateBadge({ date }: DateBadgeProps) {
  const formatted = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const isOverdue = new Date(date + 'T00:00:00') < new Date(new Date().toDateString());

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isOverdue ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-600'
      }`}
    >
      {formatted}
    </span>
  );
}
