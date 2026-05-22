import { withTelegramAuth } from '@/lib/api-handler';
import { teamService } from '@/services/teamService';

export const GET = withTelegramAuth(async (req, user, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  
  // Проверяем членство пользователя в команде (выбросит ошибку, если нет доступа)
  await teamService.getTeamById(user.id, params.id);
  
  const locations = await teamService.getRecentLocations(params.id);
  return { locations };
});
