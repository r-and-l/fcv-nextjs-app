import type { GameRegistration } from '@/types/game';

interface RegButtonProps {
  gameId: string;
  status: 'GOING' | 'NOT_GOING';
  registerForGame: (gameId: string, status: 'GOING' | 'NOT_GOING') => void;
  myReg?: GameRegistration;
}

export default function RegButton({ gameId, status, registerForGame, myReg }: RegButtonProps) {
  return (
    <button
      onClick={() => registerForGame(gameId, status)}
      className={`py-2 rounded-xl font-medium transition-all active:scale-[0.98] ${
        myReg?.status === status
          ? 'bg-green-500 text-white shadow-md'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
      }`}
    >
      {myReg?.status === status ? '' : status === 'GOING' ? '✅ Иду' : '❌ Не иду'}
    </button>
  );
}
