'use client';

import { useRouter } from 'next/navigation';
import {
  TelegramApp,
  useTelegram,
  PageLayout,
  PageHeader,
  BackButton,
  LoadingScreen,
  ProfileForm,
} from '@/components';
import { useProfile } from '@/hooks/useProfile';

function ProfileDashboard() {
  const router = useRouter();
  const { isReady, user } = useTelegram();
  const { profile, isLoading, updateProfile } = useProfile();

  if (!isReady || isLoading) {
    return <LoadingScreen message="Загрузка профиля..." />;
  }

  return (
    <PageLayout>
      <PageHeader
        title="Мой профиль"
        subtitle={`@${user?.username || 'Без юзернейма'}`}
        action={<BackButton onClick={() => router.back()} />}
      />

      {/* Спортивная статистика игрока */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-emerald-500/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            {profile?.stats?.wins ?? 0}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">Побед</div>
        </div>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-rose-500/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">
            {profile?.stats?.losses ?? 0}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">Поражений</div>
        </div>
        <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-amber-500/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            {profile?.stats?.draws ?? 0}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">Ничьих</div>
        </div>
      </div>

      <ProfileForm profile={profile} onSave={updateProfile} />
    </PageLayout>
  );
}

export default function ProfilePage() {
  return (
    <TelegramApp suspense>
      <ProfileDashboard />
    </TelegramApp>
  );
}
