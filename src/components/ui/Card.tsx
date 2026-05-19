import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-5',
};

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
