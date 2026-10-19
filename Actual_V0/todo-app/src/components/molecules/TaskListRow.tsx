interface TaskListRowProps {
  title: string;
  selected: boolean;
  onClick: () => void;
}

export default function TaskListRow({ title, selected, onClick }: TaskListRowProps) {
  return (
    <li className="border-b border-neutral-100 last:border-b-0">
      <button
        type="button"
        onClick={onClick}
        className={`w-full px-4 py-2.5 text-left cursor-pointer ${
          selected ? 'bg-neutral-100 font-medium' : 'hover:bg-neutral-50'
        }`}
      >
        {title}
      </button>
    </li>
  );
}
