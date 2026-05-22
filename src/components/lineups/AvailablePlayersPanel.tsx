'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { GameRegistration, GameLineup, TeamMember } from '@/types';

interface AvailablePlayersPanelProps {
  players: GameRegistration[];
  lineups: GameLineup[];
  onAssign: (lineupId: string, userId: number | bigint) => void;
  isAdmin?: boolean;
  unregisteredMembers?: TeamMember[];
  onRegisterMember?: (userId: number | bigint) => void;
  onAddLegioneer?: (name: string) => void;
}

export function AvailablePlayersPanel({
  players,
  lineups,
  onAssign,
  isAdmin = false,
  unregisteredMembers = [],
  onRegisterMember,
  onAddLegioneer,
}: AvailablePlayersPanelProps) {
  const [guestName, setGuestName] = useState('');

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
                key={r.user_id.toString()}
                className="flex items-center bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/40 dark:border-zinc-700/30 px-3 py-1.5 rounded-xl text-sm transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700/60"
              >
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{userName}</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) onAssign(e.target.value, Number(r.user_id));
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

      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-4">
          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Добавить игроков (Админ)
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ручная запись участника */}
            {unregisteredMembers && unregisteredMembers.length > 0 && onRegisterMember && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Записать участника команды:
                </label>
                <div className="relative">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        onRegisterMember(Number(e.target.value));
                      }
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/40 text-zinc-950 dark:text-zinc-50 text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer pr-8 font-medium"
                  >
                    <option value="" className="bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-150">Выберите участника...</option>
                    {unregisteredMembers.map((m) => {
                      const name = m.user?.first_name || m.user?.username || `ID: ${m.user_id}`;
                      const suffix = m.user?.username ? ` (@${m.user.username})` : '';
                      return (
                        <option key={m.user_id.toString()} value={m.user_id.toString()} className="bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-150">
                          {name}{suffix}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-[10px]">
                    ▼
                  </div>
                </div>
              </div>
            )}

            {/* Добавление легионера */}
            {onAddLegioneer && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (guestName.trim()) {
                    onAddLegioneer(guestName);
                    setGuestName('');
                  }
                }}
                className="flex flex-col gap-1.5"
              >
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Добавить легионера:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Имя легионера..."
                    className="flex-1 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-950 dark:text-zinc-50 text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-zinc-400 dark:placeholder-zinc-500"
                  />
                  <button
                    type="submit"
                    disabled={!guestName.trim()}
                    className="px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 border border-transparent dark:border-zinc-800/50"
                  >
                    + Добавить
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

