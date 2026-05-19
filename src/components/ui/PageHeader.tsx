import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
        {subtitle && <div className="text-sm text-zinc-500 mt-1">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function BackButton({ onClick, label = 'Назад' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
    >
      {label}
    </button>
  );
}
