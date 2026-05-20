import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between glass-panel p-4 rounded-2xl shadow-sm backdrop-blur-md">
      <div>
        <h1 className="text-xl font-bold text-zinc-955 dark:text-zinc-50 tracking-tight">{title}</h1>
        {subtitle && <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function BackButton({ onClick, label = 'Назад' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-1 text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors active:scale-95 duration-150"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6"/>
      </svg>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
