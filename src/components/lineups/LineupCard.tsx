'use client';

import { useMemo } from 'react';
import type { GameLineup } from '@/types';

interface LineupCardProps {
  lineup: GameLineup;
  isAdmin: boolean;
  isCoachOrAdmin: boolean;
  onDelete: (lineupId: string) => void;
  onRemovePlayer: (lineupId: string, userId: number | bigint) => void;
}

const positionOrder = ['Вратарь', 'Защитник', 'Полузащитник', 'Нападающий', 'Универсал'] as const;

export function LineupCard({
  lineup,
  isAdmin,
  isCoachOrAdmin,
  onDelete,
  onRemovePlayer,
}: LineupCardProps) {
  const players = lineup.players || [];

  // Группировка игроков по спортивным позициям
  const groupedPlayers = useMemo(() => {
    const list = lineup.players || [];
    const groups: Record<typeof positionOrder[number], typeof list> = {
      'Вратарь': [],
      'Защитник': [],
      'Полузащитник': [],
      'Нападающий': [],
      'Универсал': []
    };

    list.forEach((p) => {
      const pos = p.user.position || 'Универсал';
      const key = (groups[pos as keyof typeof groups] ? pos : 'Универсал') as keyof typeof groups;
      groups[key].push(p);
    });

    return groups;
  }, [lineup.players]);

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>{lineup.name}</span>
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded-full">
            {players.length}
          </span>
        </h3>
        {isAdmin && (
          <button
            onClick={() => onDelete(lineup.id)}
            className="text-zinc-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/5 active:scale-95 transition-all cursor-pointer"
            title="Удалить состав"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="space-y-3">
        {players.length === 0 ? (
          <div className="text-sm text-zinc-400 text-center py-4 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            Пусто
          </div>
        ) : (
          positionOrder.map((pos) => {
            const list = groupedPlayers[pos];
            if (list.length === 0) return null;

            const posTitle = {
              'Вратарь': '🧤 Вратарь',
              'Защитник': '🛡️ Защитники',
              'Полузащитник': '🏃 Полузащитники',
              'Нападающий': '⚡ Нападающие',
              'Универсал': '🔄 Универсалы'
            }[pos];

            return (
              <div key={pos} className="space-y-1.5">
                {/* Заголовок группы позиций с линией-разделителем */}
                <div className="flex items-center gap-2 px-1 pt-1 pb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {posTitle}
                  </span>
                  <span className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 px-1.5 py-0.1 rounded-full">
                    {list.length}
                  </span>
                  <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800/40 grow" />
                </div>

                {/* Список игроков в данной позиции */}
                <div className="space-y-1.5">
                  {list.map((p) => {
                    const userName = p.user.first_name || p.user.username || 'Игрок';
                    return (
                      <div
                        key={p.user_id.toString()}
                        className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/30 p-2.5 rounded-xl text-sm hover:bg-zinc-105 dark:hover:bg-zinc-800/60 transition-colors"
                      >
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{userName}</span>
                        {isCoachOrAdmin && (
                          <button
                            onClick={() => onRemovePlayer(lineup.id, p.user_id)}
                            className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 w-5 h-5 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                            title="Удалить из состава"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
