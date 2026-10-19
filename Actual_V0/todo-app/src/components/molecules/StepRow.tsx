import Checkbox from '@/components/atoms/Checkbox';
import { palette } from '@/lib/theme';

interface StepRowProps {
  text: string;
  completed: boolean;
  onToggle: (completed: boolean) => void;
  isFirst?: boolean;
}

export default function StepRow({ text, completed, onToggle, isFirst = false }: StepRowProps) {
  return (
    <li className={isFirst ? 'py-3' : 'py-1'}>
      <Checkbox
        checked={completed}
        onChange={onToggle}
        label={text}
        labelStyle={{
          color: completed ? undefined : palette.charcoal,
          fontSize: isFirst ? 21 : 18,
          fontWeight: isFirst ? 700 : 600,
        }}
      />
    </li>
  );
}
