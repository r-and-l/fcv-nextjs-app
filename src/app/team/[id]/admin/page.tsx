'use client';

import { use, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'auto' | 'manual' | 'reminders'>('auto');

  if (!isReady || teamLoading) return <LoadingScreen />;

  if (!team || team.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">Доступ запрещен</div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Настройки"
        subtitle={team.name}
        action={<BackButton onClick={() => router.push(`/team/${teamId}`)} label="Готово" />}
      />

      {/* Segmented Control / Tabs for Admin Settings */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl mb-4 border border-zinc-200/50 dark:border-zinc-800/40">
        <button
          onClick={() => setActiveTab('auto')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'auto'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-450 shadow-sm border border-zinc-250/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          📅 Авто-игры
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-450 shadow-sm border border-zinc-250/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          ➕ Разовая игра
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'reminders'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-450 shadow-sm border border-zinc-250/20'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          🔔 Напоминания
        </button>
      </div>

      <div className="mb-6 space-y-4">
        {activeTab === 'auto' && (
          <AddScheduleForm onAdd={addSchedule} teamId={teamId} />
        )}
        {activeTab === 'manual' && (
          <ManualGameForm teamId={teamId} initData={initData || ''} />
        )}
        {activeTab === 'reminders' && (
          <ReminderSettingsForm team={team} initData={initData || ''} />
        )}
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800 my-6" />

      <ScheduleList schedules={schedules} isLoading={schedLoading} onDelete={deleteSchedule} />
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
