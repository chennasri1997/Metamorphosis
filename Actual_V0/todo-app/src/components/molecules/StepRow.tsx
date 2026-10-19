import Checkbox from '@/components/atoms/Checkbox';

interface StepRowProps {
  text: string;
  completed: boolean;
  onToggle: (completed: boolean) => void;
}

export default function StepRow({ text, completed, onToggle }: StepRowProps) {
  return (
    <li className="py-1">
      <Checkbox checked={completed} onChange={onToggle} label={text} />
    </li>
  );
}
