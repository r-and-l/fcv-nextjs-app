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
