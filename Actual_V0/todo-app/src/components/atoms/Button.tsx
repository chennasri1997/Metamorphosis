import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

type Variant = 'primary' | 'secondary' | 'danger';

const variantToAntd: Record<Variant, Pick<AntButtonProps, 'type' | 'danger'>> = {
  primary: { type: 'primary' },
  secondary: { type: 'default' },
  danger: { type: 'primary', danger: true },
};

interface ButtonProps extends Omit<AntButtonProps, 'type' | 'danger'> {
  variant?: Variant;
}

export default function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <AntButton {...variantToAntd[variant]} {...props} />;
}
