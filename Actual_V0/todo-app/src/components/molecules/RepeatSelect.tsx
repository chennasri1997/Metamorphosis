import { Select } from 'antd';
import { REPEAT_LABELS, REPEAT_VALUES, type Repeat } from '@/lib/types';

interface RepeatSelectProps {
  value: Repeat;
  onChange: (value: Repeat) => void;
  disabled?: boolean;
  className?: string;
}

const options = REPEAT_VALUES.map((value) => ({ value, label: REPEAT_LABELS[value] }));

export default function RepeatSelect({ value, onChange, disabled, className }: RepeatSelectProps) {
  return (
    <Select
      aria-label="Repeat"
      className={className}
      value={value}
      options={options}
      disabled={disabled}
      onChange={onChange}
    />
  );
}
