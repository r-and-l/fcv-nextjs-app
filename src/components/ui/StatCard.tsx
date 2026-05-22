'use client';

export type StatCardVariant = 'emerald' | 'rose' | 'amber';

interface StatCardProps {
  value: number | string;
  label: string;
  variant?: StatCardVariant;
  className?: string;
}

const variantStyles: Record<StatCardVariant, {
  border: string;
  hoverBg: string;
  text: string;
  shadow: string;
}> = {
  emerald: {
    border: 'dark:border-emerald-500/20',
    hoverBg: 'bg-emerald-500/5',
    text: 'text-emerald-600 dark:text-emerald-400',
    shadow: 'dark:drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]',
  },
  rose: {
    border: 'dark:border-rose-500/20',
    hoverBg: 'bg-rose-500/5',
    text: 'text-rose-600 dark:text-rose-400',
    shadow: 'dark:drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]',
  },
  amber: {
    border: 'dark:border-amber-500/20',
    hoverBg: 'bg-amber-500/5',
    text: 'text-amber-600 dark:text-amber-400',
    shadow: 'dark:drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]',
  },
};

export function StatCard({
  value,
  label,
  variant = 'emerald',
  className = '',
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`bg-white/80 dark:bg-zinc-900/40 border border-zinc-200/50 ${styles.border} rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group ${className}`}
    >
      <div
        className={`absolute inset-0 ${styles.hoverBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
      />
      <div
        className={`text-2xl font-black ${styles.text} drop-shadow-sm ${styles.shadow}`}
      >
        {value}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
        {label}
      </div>
    </div>
  );
}
