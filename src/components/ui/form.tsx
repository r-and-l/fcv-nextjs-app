import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

export const inputClass =
  'w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClass} {...props} />;
}

type ButtonVariant = 'primary' | 'success' | 'ghost';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  ghost: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
};

export function Button({
  variant = 'primary',
  fullWidth = true,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}) {
  return (
    <button
      className={`${fullWidth ? 'w-full' : ''} font-medium py-3 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
      {...props}
    />
  );
}
