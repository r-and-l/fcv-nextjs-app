'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  TelegramApp,
  useTelegram,
  PageLayout,
  BackButton,
  LoadingScreen,
  TeamAdminActions,
  UpcomingGamesList,
} from '@/components';
import { useTeamData, useGames } from '@/hooks/useTeamData';
import { useProfile } from '@/hooks/useProfile';

const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'ADMIN': return '👑 Админ';
    case 'COACH': return '📋 Тренер';
    default: return '🏃 Игрок';
  }
};

const getRoleClass = (role?: string) => {
  switch (role) {
    case 'ADMIN': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
    case 'COACH': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25';
    default: return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
  }
};

function TeamDashboard({ teamId }: { teamId: string }) {
  const router = useRouter();
  const { isReady, user } = useTelegram();
  const { team, isLoading: teamLoading, error: teamError } = useTeamData(teamId);
  const { games, isLoading: gamesLoading, registerForGame, deleteGame, updateLineupScore } =
    useGames(teamId);
  const { profile, isLoading: profileLoading } = useProfile();

  if (!isReady) return <LoadingScreen />;
  if (teamLoading || profileLoading) return <LoadingScreen message="Загрузка команды..." />;
  if (teamError || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Ошибка или нет доступа
      </div>
    );
  }

  const isAdmin = team.role === 'ADMIN';
  const roleLabel = getRoleLabel(team.role);
  const roleClass = getRoleClass(team.role);
  const displayName = profile?.first_name || user?.first_name || 'Игрок';
  const displayLastName = profile?.last_name || user?.last_name || '';
  const initials = (displayName[0] || '') + (displayLastName[0] || '');
  const userPosition = profile?.position || 'Универсал';

  return (
    <PageLayout>
      {/* Шапка с названием команды и кнопкой выхода */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-black text-zinc-955 dark:text-zinc-50 tracking-tight flex items-center gap-2">
          <span className="icon-badge icon-badge-emerald shadow-sm shadow-emerald-500/10">⚽</span>
          <span>{team.name}</span>
        </h1>
        <BackButton onClick={() => router.push('/?noredirect=1')} label="Выход" />
      </div>

      {/* Премиальная карточка профиля игрока */}
      <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 mb-5 relative overflow-hidden group">
        {/* Декоративное фоновое свечение */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Аватар / Инициалы */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 dark:from-emerald-500/15 dark:to-emerald-600/5 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 shadow-inner shrink-0 text-base">
              {initials ? initials.toUpperCase() : '⚽'}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-zinc-900 dark:text-zinc-50 truncate max-w-[140px]" title={`${displayName} ${displayLastName}`}>
                  {displayName}
                </span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${roleClass}`}>
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                <span>Позиция:</span>
                <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                  {userPosition}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/profile')}
            className="pl-2 pr-3 py-1.5 text-xs font-bold bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm hover:shadow"
            title="Редактировать профиль"
          >
            <span className="icon-badge w-6 h-6 text-[10px] bg-zinc-250/50 dark:bg-zinc-700/50">⚙️</span>
            <span>Профиль</span>
          </button>
        </div>
      </div>

      {isAdmin && <TeamAdminActions teamId={teamId} />}

      <UpcomingGamesList
        games={games}
        teamId={teamId}
        userId={user?.id}
        isAdmin={isAdmin}
        isLoading={gamesLoading}
        onRegister={registerForGame}
        onDelete={deleteGame}
        onUpdateScore={updateLineupScore}
      />
    </PageLayout>
  );
}

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <TelegramApp>
      <TeamDashboard teamId={id} />
    </TelegramApp>
  );
}
