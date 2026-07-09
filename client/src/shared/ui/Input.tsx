import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export const Input = ({ label, className, ...props }: InputProps) => (
  <label className="field">
    {label ? <span className="field__label">{label}</span> : null}
    <input className={clsx('input', className)} {...props} />
  </label>
);

export const Textarea = ({ label, className, ...props }: TextareaProps) => (
  <label className="field">
    {label ? <span className="field__label">{label}</span> : null}
    <textarea className={clsx('input', 'input--textarea', className)} {...props} />
  </label>
);
