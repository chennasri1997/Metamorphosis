import { Checkbox as AntCheckbox } from 'antd';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <AntCheckbox checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)}>
      <span className={checked ? 'line-through text-neutral-400' : ''}>{label}</span>
    </AntCheckbox>
  );
}
