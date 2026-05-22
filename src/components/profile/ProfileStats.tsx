'use client';

import { StatCard } from '@/components/ui/StatCard';

interface ProfileStatsProps {
  wins?: number;
  losses?: number;
  draws?: number;
  className?: string;
}

export function ProfileStats({
  wins = 0,
  losses = 0,
  draws = 0,
  className = '',
}: ProfileStatsProps) {
  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`}>
      <StatCard value={wins} label="Побед" variant="emerald" />
      <StatCard value={losses} label="Поражений" variant="rose" />
      <StatCard value={draws} label="Ничьих" variant="amber" />
    </div>
  );
}

