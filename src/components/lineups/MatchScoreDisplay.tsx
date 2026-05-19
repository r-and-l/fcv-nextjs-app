import type { GameLineup } from '@/types/game';

interface MatchScoreDisplayProps {
  lineups: [GameLineup, GameLineup];
  size?: 'sm' | 'lg';
}

export function MatchScoreDisplay({ lineups, size = 'sm' }: MatchScoreDisplayProps) {
  const scoreClass =
    size === 'lg'
      ? 'text-3xl font-bold'
      : 'text-base font-bold';

  return (
    <div className="flex items-center justify-center gap-3">
      <span className="font-medium text-sm truncate">{lineups[0].name}</span>
      <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl shrink-0">
        <span className={`${scoreClass} text-blue-600 dark:text-blue-400`}>
          {lineups[0].score ?? '-'}
        </span>
        <span className="text-zinc-400 font-bold">:</span>
        <span className={`${scoreClass} text-red-600 dark:text-red-400`}>
          {lineups[1].score ?? '-'}
        </span>
      </div>
      <span className="font-medium text-sm truncate">{lineups[1].name}</span>
    </div>
  );
}
