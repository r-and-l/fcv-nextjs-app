'use client';

import type { GameLineup } from '@/types';

interface LineupCardProps {
  lineup: GameLineup;
  isAdmin: boolean;
  isCoachOrAdmin: boolean;
  onDelete: (lineupId: string) => void;
  onRemovePlayer: (lineupId: string, userId: number) => void;
}

export function LineupCard({
  lineup,
  isAdmin,
  isCoachOrAdmin,
  onDelete,
  onRemovePlayer,
}: LineupCardProps) {
  const players = lineup.players || [];

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
          {lineup.name} <span className="text-sm font-semibold text-zinc-400">({players.length})</span>
        </h3>
        {isAdmin && (
          <button
            onClick={() => onDelete(lineup.id)}
            className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/5 active:scale-95 transition-all"
            title="Удалить состав"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="space-y-2">
        {players.length === 0 ? (
          <div className="text-sm text-zinc-400 text-center py-4 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            Пусто
          </div>
        ) : (
          players.map((p) => {
            const userName = p.user.first_name || p.user.username || 'Игрок';
            return (
              <div
                key={p.user_id}
                className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/30 p-2.5 rounded-xl text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{userName}</span>
                {isCoachOrAdmin && (
                  <button
                    onClick={() => onRemovePlayer(lineup.id, p.user_id)}
                    className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 w-6 height-6 rounded-full flex items-center justify-center transition-all active:scale-90"
                    title="Удалить из состава"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
