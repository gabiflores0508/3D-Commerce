import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const base =
  'w-full rounded-xl border border-ink-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-mute transition focus:border-ink focus:outline-none';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: string }>(
  function Input({ className, error, ...rest }, ref) {
    return (
      <>
        <input ref={ref} className={cn(base, error && 'border-rose-400', className)} {...rest} />
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }>(
  function Textarea({ className, error, ...rest }, ref) {
    return (
      <>
        <textarea ref={ref} className={cn(base, 'min-h-[110px]', error && 'border-rose-400', className)} {...rest} />
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </>
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { error?: string }>(
  function Select({ className, error, children, ...rest }, ref) {
    return (
      <>
        <select ref={ref} className={cn(base, 'pr-10', error && 'border-rose-400', className)} {...rest}>
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </>
    );
  },
);

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft', className)}>
      {children}
    </label>
  );
}
