import { TeamMemberWithUser } from '@/types';

interface MembersListProps {
  members: TeamMemberWithUser[];
  currentUserId?: number | bigint;
  onUpdateRole: (userId: number | bigint, role: string) => void;
}

export function MembersList({ members, currentUserId, onUpdateRole }: MembersListProps) {
  return (
    <div className="space-y-3">
      {members.map((m) => {
        const isMe = m.user_id === currentUserId;
        const name = m.user.first_name || m.user.username || 'Без имени';

        return (
          <div
            key={m.user_id.toString()}
            className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm"
          >
            <div>
              <div className="font-medium">
                {name} {isMe && '(Вы)'}
              </div>
              {m.user.username && (
                <div className="text-xs text-zinc-500">@{m.user.username}</div>
              )}
            </div>

            <select
              value={m.role}
              disabled={isMe}
              onChange={(e) => onUpdateRole(m.user_id, e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800 text-sm border-0 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="MEMBER">Игрок</option>
              <option value="COACH">Тренер (составы)</option>
              <option value="ADMIN">Админ</option>
            </select>
          </div>
        );
      })}
    </div>
  );
}
