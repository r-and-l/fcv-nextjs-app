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
      className={`glass-panel rounded-2xl shadow-sm ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
