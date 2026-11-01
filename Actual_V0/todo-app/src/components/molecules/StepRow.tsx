import Checkbox from '@/components/atoms/Checkbox';
import { palette } from '@/lib/theme';

interface StepRowProps {
  text: string;
  completed: boolean;
  onToggle: (completed: boolean) => void;
  isFirst?: boolean;
  style?: React.CSSProperties;
}

export default function StepRow({ text, completed, onToggle, isFirst = false, style }: StepRowProps) {
  return (
    <li data-step-row={style ? '' : undefined} className={style ? 'flex items-center' : isFirst ? 'py-3' : 'py-1'} style={style}>
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
