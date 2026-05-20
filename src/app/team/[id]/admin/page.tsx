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
  ScheduleList,
  AddScheduleForm,
  ManualGameForm,
  ReminderSettingsForm,
} from '@/components';
import { useTeamData } from '@/hooks/useTeamData';
import { useSchedules } from '@/hooks/useSchedules';

function AdminDashboard({ teamId }: { teamId: string }) {
  const router = useRouter();
  const { isReady, initData } = useTelegram();
  const { team, isLoading: teamLoading } = useTeamData(teamId);
  const { schedules, isLoading: schedLoading, addSchedule, deleteSchedule } = useSchedules(teamId);

  if (!isReady || teamLoading) return <LoadingScreen />;

  if (!team || team.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">Доступ запрещен</div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Настройки расписания"
        subtitle={team.name}
        action={<BackButton onClick={() => router.push(`/team/${teamId}`)} label="Готово" />}
      />
      <ReminderSettingsForm team={team} initData={initData || ''} />
      <ScheduleList schedules={schedules} isLoading={schedLoading} onDelete={deleteSchedule} />
      <AddScheduleForm onAdd={addSchedule} />
      <ManualGameForm teamId={teamId} initData={initData || ''} />
    </PageLayout>
  );
}

export default function AdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <TelegramApp>
      <AdminDashboard teamId={id} />
    </TelegramApp>
  );
}
