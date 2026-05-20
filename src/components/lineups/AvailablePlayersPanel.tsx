'use client';

import { Card } from '@/components/ui/Card';
import type { GameRegistration, GameLineup } from '@/types';

interface AvailablePlayersPanelProps {
  players: GameRegistration[];
  lineups: GameLineup[];
  onAssign: (lineupId: string, userId: number) => void;
}

export function AvailablePlayersPanel({ players, lineups, onAssign }: AvailablePlayersPanelProps) {
  return (
    <Card padding="sm">
      <h2 className="text-sm font-bold text-zinc-500 mb-3 tracking-wide uppercase">
        Доступные игроки ({players.length})
      </h2>
      <div className="flex flex-wrap gap-2">
        {players.length === 0 ? (
          <div className="text-sm text-zinc-400 py-1">Все игроки распределены по составам</div>
        ) : (
          players.map((r) => {
            const userName = r.user.first_name || r.user.username || 'Игрок';
            return (
              <div
                key={r.user_id}
                className="flex items-center bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/40 dark:border-zinc-700/30 px-3 py-1.5 rounded-xl text-sm transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700/60"
              >
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{userName}</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) onAssign(e.target.value, r.user_id);
                    e.target.value = '';
                  }}
                  className="ml-2 bg-transparent text-emerald-600 dark:text-emerald-400 text-xs font-semibold outline-none cursor-pointer border-none p-0 focus:ring-0 focus:outline-none"
                >
                  <option value="" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">В команду...</option>
                  {lineups.map((l) => (
                    <option key={l.id} value={l.id} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
