'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  TelegramApp,
  useTelegram,
  PageLayout,
  PageHeader,
  BackButton,
  LoadingScreen,
  TeamAdminActions,
  UpcomingGamesList,
} from '@/components';
import { useTeamData, useGames } from '@/hooks/useTeamData';
import { useProfile } from '@/hooks/useProfile';

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

  return (
    <PageLayout>
      <PageHeader
        title={team.name}
        subtitle={
          <button
            onClick={() => router.push('/profile')}
            className="text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {isAdmin ? '👑 ' : '👥'} {profile?.first_name || user?.first_name}
          </button>
        }
        action={<BackButton onClick={() => router.push('/?noredirect=1')} />}
      />

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
