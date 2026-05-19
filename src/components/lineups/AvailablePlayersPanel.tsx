'use client';

import { Card } from '@/components/ui/Card';

interface AvailablePlayersPanelProps {
  players: any[];
  lineups: any[];
  onAssign: (lineupId: string, userId: number) => void;
}

export function AvailablePlayersPanel({ players, lineups, onAssign }: AvailablePlayersPanelProps) {
  return (
    <Card padding="sm">
      <h2 className="text-sm font-bold text-zinc-500 mb-3">
        ДОСТУПНЫЕ ИГРОКИ ({players.length})
      </h2>
      <div className="flex flex-wrap gap-2">
        {players.length === 0 ? (
          <div className="text-sm text-zinc-400">Все распределены</div>
        ) : (
          players.map((r) => (
            <div
              key={r.user_id}
              className="flex items-center bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-sm"
            >
              <span>{r.user.first_name || r.user.username || 'Игрок'}</span>
              <select
                onChange={(e) => {
                  if (e.target.value) onAssign(e.target.value, r.user_id);
                  e.target.value = '';
                }}
                className="ml-2 bg-transparent text-blue-500 text-xs outline-none cursor-pointer"
              >
                <option value="">В команду...</option>
                {lineups.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
