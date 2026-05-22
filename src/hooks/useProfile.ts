import useSWR from 'swr';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { ProfileUpdateData, User } from '@/types';

export interface UserProfile extends User {
  stats?: {
    wins: number;
    losses: number;
    draws: number;
  };
}

const fetcher = async ([url, initData]: [string, string]): Promise<{ user: UserProfile }> => {
  const res = await fetch(url, {
    headers: { 'x-telegram-init-data': initData },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
};

export function useProfile() {
  const { initData } = useTelegram();

  const { data, error, isLoading, mutate } = useSWR<{ user: UserProfile }>(
    initData ? ['/api/users/me', initData] : null,
    fetcher
  );

  const updateProfile = async (profileData: ProfileUpdateData) => {
    if (!initData) return;
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-init-data': initData,
      },
      body: JSON.stringify(profileData),
    });
    if (res.ok) {
      mutate();
    }
  };

  return {
    profile: data?.user || null,
    isLoading,
    error,
    updateProfile,
  };
}
