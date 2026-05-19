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
  MembersList,
} from '@/components';
import { useTeamData, useTeamMembers } from '@/hooks/useTeamData';

function MembersDashboard({ teamId }: { teamId: string }) {
  const router = useRouter();
  const { isReady, user } = useTelegram();
  const { team, isLoading: teamLoading } = useTeamData(teamId);
  const { members, isLoading: membersLoading, updateRole } = useTeamMembers(teamId);

  if (!isReady || teamLoading || membersLoading) return <LoadingScreen />;

  if (!team || team.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">Доступ запрещен</div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Участники"
        subtitle={team.name}
        action={<BackButton onClick={() => router.push(`/team/${teamId}`)} />}
      />
      <MembersList members={members} currentUserId={user?.id} onUpdateRole={updateRole} />
    </PageLayout>
  );
}

export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <TelegramApp>
      <MembersDashboard teamId={id} />
    </TelegramApp>
  );
}
