import useSWR from 'swr';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { Game, GameLineup, MiniGame, MyTeam, TeamMemberWithUser } from '@/types';

export function useTeamData(teamId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string): Promise<{ team: MyTeam } | null> => {
    if (!initData) return null;
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch team');
    return res.json();
  };

  const { data, error, isLoading } = useSWR<{ team: MyTeam } | null>(
    initData && teamId ? `/api/teams/${teamId}` : null,
    fetcher
  );
  return { team: data?.team, isLoading, error };
}

export function useGames(teamId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string): Promise<{ games: Game[] }> => {
    if (!initData) return { games: [] };
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch games');
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR<{ games: Game[] }>(
    initData && teamId ? `/api/games?teamId=${teamId}` : null,
    fetcher
  );

  const registerForGame = async (gameId: string, status: 'GOING' | 'NOT_GOING' | 'MAYBE') => {
    if (!initData) return;
    const res = await fetch('/api/games/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, gameId, status })
    });
    if (res.ok) {
      mutate(); // Re-fetch games to update registration counts
    }
  };

  const deleteGame = async (gameId: string) => {
    if (!initData) return;
    const res = await fetch(`/api/games?gameId=${gameId}&teamId=${teamId}`, {
      method: 'DELETE',
      headers: { 'x-telegram-init-data': initData }
    });
    if (res.ok) {
      mutate();
    }
  };

  const updateLineupScore = async (gameId: string, lineupId: string, score: number | null) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups/score`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ lineupId, score })
    });
    if (res.ok) mutate();
  };

  return { games: data?.games || [], isLoading, error, registerForGame, deleteGame, updateLineupScore };
}

export function useGame(gameId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string): Promise<{ game: Game | null }> => {
    if (!initData) return { game: null };
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch game');
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR<{ game: Game | null }>(
    initData && gameId ? `/api/games/${gameId}` : null,
    fetcher
  );

  return { game: data?.game || null, isLoading, error, mutate };
}

export function useArchiveGames(teamId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string): Promise<{ games: Game[] }> => {
    if (!initData) return { games: [] };
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch archive games');
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR<{ games: Game[] }>(
    initData && teamId ? `/api/games/archive?teamId=${teamId}` : null,
    fetcher
  );

  const updateLineupScore = async (gameId: string, lineupId: string, score: number | null) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups/score`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ lineupId, score })
    });
    if (res.ok) mutate();
  };

  const deleteGame = async (gameId: string) => {
    if (!initData) return;
    const res = await fetch(`/api/games?gameId=${gameId}&teamId=${teamId}`, {
      method: 'DELETE',
      headers: { 'x-telegram-init-data': initData }
    });
    if (res.ok) mutate();
  };

  return { games: data?.games || [], isLoading, error, updateLineupScore, deleteGame };
}

export function useTeamMembers(teamId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string): Promise<{ members: TeamMemberWithUser[] }> => {
    if (!initData) return { members: [] };
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR<{ members: TeamMemberWithUser[] }>(
    initData && teamId ? `/api/teams/${teamId}/members` : null,
    fetcher
  );

  const updateRole = async (targetUserId: number | bigint, newRole: string) => {
    if (!initData) return;
    const res = await fetch(`/api/teams/${teamId}/members`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ targetUserId: typeof targetUserId === 'bigint' ? Number(targetUserId) : targetUserId, newRole })
    });
    if (res.ok) mutate();
  };

  return { members: data?.members || [], isLoading, error, updateRole };
}

export function useGameLineups(gameId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string): Promise<{ lineups: GameLineup[] }> => {
    if (!initData) return { lineups: [] };
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch lineups');
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR<{ lineups: GameLineup[] }>(
    initData && gameId ? `/api/games/${gameId}/lineups` : null,
    fetcher
  );

  const createLineup = async (name: string) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ name })
    });
    if (res.ok) mutate();
  };

  const deleteLineup = async (lineupId: string) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups?lineupId=${lineupId}`, {
      method: 'DELETE',
      headers: { 'x-telegram-init-data': initData }
    });
    if (res.ok) mutate();
  };

  const assignPlayer = async (lineupId: string, userId: number | bigint) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ lineupId, userId: typeof userId === 'bigint' ? Number(userId) : userId })
    });
    if (res.ok) mutate();
  };

  const removePlayer = async (lineupId: string, userId: number | bigint) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups/players?lineupId=${lineupId}&userId=${userId}`, {
      method: 'DELETE',
      headers: { 'x-telegram-init-data': initData }
    });
    if (res.ok) mutate();
  };

  const updateLineupScore = async (lineupId: string, score: number | null | '') => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups/score`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ lineupId, score })
    });
    if (res.ok) mutate();
  };

  return {
    lineups: data?.lineups || [],
    isLoading,
    error,
    createLineup,
    deleteLineup,
    assignPlayer,
    removePlayer,
    updateLineupScore
  };
}

export function useMiniGames(gameId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string): Promise<{ miniGames: MiniGame[] }> => {
    if (!initData) return { miniGames: [] };
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch mini-games');
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR<{ miniGames: MiniGame[] }>(
    initData && gameId ? `/api/games/${gameId}/mini-games` : null,
    fetcher
  );

  const generateMatches = async () => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/mini-games/generate`, {
      method: 'POST',
      headers: { 'x-telegram-init-data': initData }
    });
    if (res.ok) mutate();
  };

  const updateScore = async (miniGameId: string, homeScore: number | null, awayScore: number | null) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/mini-games`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ miniGameId, homeScore, awayScore })
    });
    if (res.ok) mutate();
  };

  return {
    miniGames: data?.miniGames || [],
    isLoading,
    error,
    generateMatches,
    updateScore
  };
}
