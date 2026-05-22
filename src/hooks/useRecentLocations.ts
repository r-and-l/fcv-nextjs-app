import useSWR from 'swr';
import { useTelegram } from '@/components/providers/TelegramProvider';

export interface LocationItem {
  location: string;
  latitude: number | null;
  longitude: number | null;
}

export function useRecentLocations(teamId?: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string) => {
    if (!initData) return [];
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch recent locations');
    const json = await res.json();
    return json.locations || [];
  };

  const { data, error, isLoading, mutate } = useSWR<LocationItem[]>(
    initData && teamId ? `/api/teams/${teamId}/locations` : null,
    fetcher
  );

  return {
    locations: data || [],
    isLoading,
    error,
    mutateLocations: mutate,
  };
}
