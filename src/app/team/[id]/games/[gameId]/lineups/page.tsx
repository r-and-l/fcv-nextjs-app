'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TelegramApp,
  useTelegram,
  PageLayout,
  PageHeader,
  BackButton,
  LoadingScreen,
  AvailablePlayersPanel,
  LineupCard,
  AddLineupForm,
  TournamentTable,
  MiniGamesPanel,
} from '@/components';
import { formatInMoscow } from '@/lib/timezone';
import { useTeamData, useGameLineups, useGame, useMiniGames, useTeamMembers } from '@/hooks/useTeamData';
import { TeamMember } from '@/types';

function LineupsDashboard({ teamId, gameId }: { teamId: string; gameId: string }) {
  const router = useRouter();
  const { isReady, initData } = useTelegram();
  const { team, isLoading: teamLoading } = useTeamData(teamId);
  const { game, isLoading: gameLoading, mutate: mutateGame } = useGame(gameId);
  const { members } = useTeamMembers(teamId);
  const {
    lineups,
    isLoading: lineupsLoading,
    createLineup,
    deleteLineup,
    assignPlayer,
    removePlayer,
  } = useGameLineups(gameId);

  const {
    miniGames,
    isLoading: miniGamesLoading,
    generateMatches,
    updateScore,
  } = useMiniGames(gameId);

  const [activeTab, setActiveTab] = useState<'standings' | 'matches' | 'lineups'>('standings');
  const [generating, setGenerating] = useState(false);
  const [localHours, setLocalHours] = useState<string | null>(null);
  const [localText, setLocalText] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);
  const gameEndTime = useMemo(() => {
    if (!game) return new Date();
    return new Date(new Date(game.date).getTime() + (game.duration || 60) * 60 * 1000);
  }, [game]);

  const availablePlayers = useMemo(() => {
    if (!game) return [];
    const going = game.registrations?.filter((r) => r.status === 'GOING') || [];
    const assignedUserIds = new Set<number>();
    lineups.forEach((l) => {
      l.players?.forEach((p) => assignedUserIds.add(Number(p.user_id)));
    });
    return going.filter((r) => !assignedUserIds.has(Number(r.user_id)));
  }, [game, lineups]);

  const unregisteredMembers = useMemo(() => {
    if (!members || !game) return [];
    const goingUserIds = new Set(
      game.registrations
        ?.filter((r) => r.status === 'GOING')
        .map((r) => Number(r.user_id)) || []
    );
    return members.filter((m: TeamMember) => !goingUserIds.has(Number(m.user_id)));
  }, [members, game]);

  const handleRegisterMember = async (userId: number | bigint) => {
    if (!initData) return;
    try {
      const res = await fetch(`/api/games/${gameId}/register/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ userId: typeof userId === 'bigint' ? Number(userId) : userId, status: 'GOING' })
      });
      if (res.ok) {
        mutateGame();
      } else {
        const data = await res.json();
        alert(data.error || 'Не удалось записать игрока');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при записи игрока');
    }
  };

  const handleCreateLegioneer = async (name: string) => {
    if (!initData) return;
    try {
      const res = await fetch(`/api/games/${gameId}/legioneers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        mutateGame();
      } else {
        const data = await res.json();
        alert(data.error || 'Не удалось создать легионера');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при создании легионера');
    }
  };

  const isTournament = lineups.length >= 3;

  // Tournament calculations
  const tournamentCalc = useMemo(() => {
    if (!game || lineups.length < 3) return null;
    const N = lineups.length;
    const M = (N * (N - 1)) / 2;
    const matchDuration = 10;
    const circleDuration = M * matchDuration;
    const circles = Math.max(1, Math.floor((game.duration || 60) / circleDuration));
    return {
      circles,
      matchesPerCircle: M,
      totalMatches: circles * M
    };
  }, [game, lineups]);

  if (!isReady || teamLoading || gameLoading || lineupsLoading || miniGamesLoading) {
    return <LoadingScreen />;
  }

  if (!game || !team) {
    return (
      <PageLayout>
        <PageHeader
          title="Составы на игру"
          subtitle="Ошибка"
          action={<BackButton onClick={() => router.back()} />}
        />
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
          <span className="text-4xl mb-4">⚠️</span>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Игра не найдена</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mb-6">
            Не удалось загрузить данные об этой игре. Возможно, она была удалена.
          </p>
        </div>
      </PageLayout>
    );
  }

  const isCoachOrAdmin = team.role === 'ADMIN' || team.role === 'COACH';
  const isAdmin = team.role === 'ADMIN';
  const isFinished = now > gameEndTime;
  const canEditLineups = isFinished ? isAdmin : isCoachOrAdmin;
  const isMember = !!team.role;
  const canEditMatches = isTournament 
    ? (isFinished ? isAdmin : isMember) 
    : canEditLineups;
  const reminderHours = localHours !== null ? localHours : (game?.reminder_hours === null ? 'disabled' : String(game?.reminder_hours ?? '24'));
  const reminderText = localText !== null ? localText : (game?.reminder_text || '');

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      await generateMatches();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={isTournament ? 'Турнир' : 'Составы на игру'}
        subtitle={formatInMoscow(game.date, { day: 'numeric', month: 'long' })}
        action={<BackButton onClick={() => router.back()} />}
      />
      {isAdmin && !isFinished && (
        <div className="mb-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-2 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">⏱️ Длительность игры:</span>
            <select
              value={game.duration || 60}
              onChange={async (e) => {
                const newDuration = Number(e.target.value);
                try {
                  const res = await fetch(`/api/games/${game.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData || '' },
                    body: JSON.stringify({ duration: newDuration }),
                  });
                  if (res.ok) {
                    mutateGame();
                  } else {
                    alert('Не удалось обновить длительность');
                  }
                } catch (err) {
                  console.error(err);
                  alert('Ошибка сети');
                }
              }}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="60">60 минут (1 ч)</option>
              <option value="90">90 минут (1.5 ч)</option>
              <option value="120">120 минут (2 ч)</option>
              <option value="150">150 минут (2.5 ч)</option>
              <option value="180">180 минут (3 ч)</option>
            </select>
          </div>
          {isTournament && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">
              Изменение длительности игры пересчитает количество доступных кругов и матчей.
            </p>
          )}

          <div className="flex justify-between items-center mt-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-2">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">🔔 Напоминание в чат:</span>
            <select
              value={reminderHours}
              onChange={async (e) => {
                const val = e.target.value;
                setLocalHours(val);
                const hrs = val === 'disabled' ? null : Number(val);
                try {
                  const res = await fetch(`/api/games/${game.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData || '' },
                    body: JSON.stringify({ reminder_hours: hrs }),
                  });
                  if (res.ok) {
                    mutateGame();
                  } else {
                    alert('Не удалось обновить напоминание');
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="disabled">Выключено</option>
              <option value="1">За 1 час</option>
              <option value="2">За 2 часа</option>
              <option value="3">За 3 часа</option>
              <option value="4">За 4 часа</option>
              <option value="6">За 6 часов</option>
              <option value="12">За 12 часов</option>
              <option value="24">За 24 часа</option>
              <option value="48">За 48 часов</option>
            </select>
          </div>

          {reminderHours !== 'disabled' && (
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">Текст напоминания (кликните в сторону для сохранения):</span>
              <input
                type="text"
                value={reminderText}
                onChange={(e) => setLocalText(e.target.value)}
                onBlur={async () => {
                  try {
                    const res = await fetch(`/api/games/${game.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData || '' },
                      body: JSON.stringify({ reminder_text: reminderText }),
                    });
                    if (res.ok) {
                      mutateGame();
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                placeholder="Текст напоминания..."
              />
            </div>
          )}
        </div>
      )}

      {isTournament && (
        <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-100 dark:border-zinc-800/50 rounded-xl text-xs text-zinc-500 dark:text-zinc-450">
          📍 <span className="font-semibold text-zinc-700 dark:text-zinc-300">{lineups.length} составов</span>. 
          При длительности матча 10 минут доступно: <span className="font-bold text-emerald-600 dark:text-emerald-450">{tournamentCalc?.circles} круга</span> ({tournamentCalc?.totalMatches} игр всего).
        </div>
      )}

      {/* Segmented Control / Tabs for Tournament */}
      {isTournament && miniGames.length > 0 && (
        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl mb-4 border border-zinc-200/50 dark:border-zinc-800/40">
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'standings'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-zinc-250/20'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            🏆 Таблица
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-zinc-250/20'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            🔄 Матчи
          </button>
          <button
            onClick={() => setActiveTab('lineups')}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'lineups'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-zinc-250/20'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            👥 Составы
          </button>
        </div>
      )}

      {/* Render based on tournament status and active tab */}
      {isTournament && miniGames.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center space-y-4">
          <div className="text-4xl">📊</div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Матчи не созданы</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Вы сформировали {lineups.length} составов. Сгенерируйте сетку матчей кругового турнира, чтобы начать вносить результаты игр.
          </p>
          {isAdmin ? (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full max-w-xs py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {generating ? 'Генерация...' : '⚙️ Сгенерировать сетку турнира'}
            </button>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">Ожидайте, пока администратор создаст сетку матчей.</p>
          )}
        </div>
      ) : isTournament ? (
        <>
          {activeTab === 'standings' && (
            <TournamentTable lineups={lineups} miniGames={miniGames} />
          )}

          {activeTab === 'matches' && (
            <MiniGamesPanel
              lineups={lineups}
              miniGames={miniGames}
              canEdit={canEditMatches}
              onUpdateScore={updateScore}
            />
          )}

          {activeTab === 'lineups' && (
            <div className="space-y-4">
              {isAdmin && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-600 dark:text-amber-400">
                  ⚠️ <strong>Внимание</strong>: добавление или удаление составов сбросит сетку матчей и результаты текущего турнира!
                </div>
              )}
              
              {canEditLineups && (
                <AvailablePlayersPanel
                  players={availablePlayers}
                  lineups={lineups}
                  onAssign={assignPlayer}
                  isAdmin={isAdmin}
                  unregisteredMembers={unregisteredMembers}
                  onRegisterMember={handleRegisterMember}
                  onAddLegioneer={handleCreateLegioneer}
                />
              )}

              <div className="space-y-4">
                {lineups.map((lineup) => (
                  <LineupCard
                    key={lineup.id}
                    lineup={lineup}
                    isAdmin={isAdmin && !isFinished}
                    isCoachOrAdmin={canEditLineups}
                    onDelete={deleteLineup}
                    onRemovePlayer={removePlayer}
                  />
                ))}
              </div>

              {isAdmin && !isFinished && <AddLineupForm onAdd={createLineup} />}
            </div>
          )}
        </>
      ) : (
        /* Regular 2-team game mode */
        <div className="space-y-4">
          {canEditLineups && (
            <AvailablePlayersPanel
              players={availablePlayers}
              lineups={lineups}
              onAssign={assignPlayer}
              isAdmin={isAdmin}
              unregisteredMembers={unregisteredMembers}
              onRegisterMember={handleRegisterMember}
              onAddLegioneer={handleCreateLegioneer}
            />
          )}

          <div className="space-y-4">
            {lineups.map((lineup) => (
              <LineupCard
                key={lineup.id}
                lineup={lineup}
                isAdmin={isAdmin && !isFinished}
                isCoachOrAdmin={canEditLineups}
                onDelete={deleteLineup}
                onRemovePlayer={removePlayer}
              />
            ))}
          </div>

          {isAdmin && !isFinished && <AddLineupForm onAdd={createLineup} />}
        </div>
      )}
    </PageLayout>
  );
}

export default function LineupsPage({ params }: { params: Promise<{ id: string; gameId: string }> }) {
  const { id, gameId } = use(params);

  return (
    <TelegramApp>
      <LineupsDashboard teamId={id} gameId={gameId} />
    </TelegramApp>
  );
}
