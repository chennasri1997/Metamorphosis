import { Checkbox as AntCheckbox } from 'antd';
import type { CSSProperties } from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  labelStyle?: CSSProperties;
}

export default function Checkbox({ checked, onChange, label, disabled, labelStyle }: CheckboxProps) {
  return (
    <AntCheckbox
      className="task-completion-checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    >
      <span className={checked ? 'line-through text-neutral-400' : ''} style={labelStyle}>
        {label}
      </span>
    </AntCheckbox>
  );
}
