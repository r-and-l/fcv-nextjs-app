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
  ArchiveGamesList,
} from '@/components';
import { useTeamData, useArchiveGames } from '@/hooks/useTeamData';

function ArchiveDashboard({ teamId }: { teamId: string }) {
  const router = useRouter();
  const { isReady } = useTelegram();
  const { team, isLoading: teamLoading } = useTeamData(teamId);
  const { games, isLoading: gamesLoading } = useArchiveGames(teamId);

  if (!isReady || teamLoading || gamesLoading) return <LoadingScreen />;

  return (
    <PageLayout>
      <PageHeader
        title="Архив игр"
        subtitle={team?.name}
        action={<BackButton onClick={() => router.back()} />}
      />
      <ArchiveGamesList games={games} />
    </PageLayout>
  );
}

export default function ArchivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <TelegramApp suspense>
      <ArchiveDashboard teamId={id} />
    </TelegramApp>
  );
}
