'use client';

interface LineupCardProps {
  lineup: any;
  isAdmin: boolean;
  isCoachOrAdmin: boolean;
  onDelete: (lineupId: string) => void;
  onRemovePlayer: (lineupId: string, userId: number) => void;
}

export function LineupCard({
  lineup,
  isAdmin,
  isCoachOrAdmin,
  onDelete,
  onRemovePlayer,
}: LineupCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">
          {lineup.name} ({lineup.players.length})
        </h3>
        {isAdmin && (
          <button
            onClick={() => onDelete(lineup.id)}
            className="text-red-500 hover:text-red-600 p-1"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="space-y-2">
        {lineup.players.length === 0 ? (
          <div className="text-sm text-zinc-400">Пусто</div>
        ) : (
          lineup.players.map((p: any) => (
            <div
              key={p.user_id}
              className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg text-sm"
            >
              <span>{p.user.first_name || p.user.username || 'Игрок'}</span>
              {isCoachOrAdmin && (
                <button
                  onClick={() => onRemovePlayer(lineup.id, p.user_id)}
                  className="text-zinc-400 hover:text-red-500 px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
