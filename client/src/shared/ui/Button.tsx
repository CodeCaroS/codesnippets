import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export const Button = ({ className, variant = 'primary', ...props }: ButtonProps) => (
  <button
    className={clsx('button', `button--${variant}`, className)}
    {...props}
  />
);
