import { BRIDGE_COLOR } from '@/lib/theme';

interface TaskListRowProps {
  title: string;
  selected: boolean;
  onClick: () => void;
  rowRef?: (el: HTMLDivElement | null) => void;
}

export default function TaskListRow({ title, selected, onClick, rowRef }: TaskListRowProps) {
  return (
    <div
      ref={rowRef}
      onClick={onClick}
      className={`-mx-4 -my-3 cursor-pointer px-4 py-3 ${selected ? 'font-medium' : ''}`}
      style={selected ? { backgroundColor: BRIDGE_COLOR } : undefined}
    >
      {title}
    </div>
  );
}
