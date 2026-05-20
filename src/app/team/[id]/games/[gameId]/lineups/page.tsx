'use client';

import { use, useMemo } from 'react';
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
} from '@/components';
import { formatInMoscow } from '@/lib/timezone';
import { useTeamData, useGameLineups, useGames } from '@/hooks/useTeamData';

function LineupsDashboard({ teamId, gameId }: { teamId: string; gameId: string }) {
  const router = useRouter();
  const { isReady } = useTelegram();
  const { team, isLoading: teamLoading } = useTeamData(teamId);
  const { games, isLoading: gamesLoading } = useGames(teamId);
  const {
    lineups,
    isLoading: lineupsLoading,
    createLineup,
    deleteLineup,
    assignPlayer,
    removePlayer,
  } = useGameLineups(gameId);

  const game = useMemo(() => games.find((g) => g.id === gameId), [games, gameId]);

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

  if (!isReady || teamLoading || gamesLoading || lineupsLoading) return <LoadingScreen />;

  if (!game || !team) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Ошибка</div>;
  }

  const isCoachOrAdmin = team.role === 'ADMIN' || team.role === 'COACH';
  const isAdmin = team.role === 'ADMIN';

  const isFinished = now > gameEndTime;

  // Если игра завершена, редактировать составы может только ADMIN
  const canEditLineups = isFinished ? isAdmin : isCoachOrAdmin;

  return (
    <PageLayout>
      <PageHeader
        title="Составы на игру"
        subtitle={formatInMoscow(game.date, { day: 'numeric', month: 'long' })}
        action={<BackButton onClick={() => router.push(`/team/${teamId}`)} />}
      />

      {canEditLineups && (
        <AvailablePlayersPanel
          players={availablePlayers}
          lineups={lineups}
          onAssign={assignPlayer}
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
