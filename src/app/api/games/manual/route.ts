import { withTelegramAuth } from '@/lib/api-handler';
import { parseMoscowDateTime } from '@/lib/timezone';
import { gameService } from '@/services/gameService';
import { teamService } from '@/services/teamService';
import { gameMessageBuilder } from '@/lib/gameMessageBuilder';

export const POST = withTelegramAuth(async (req, user) => {
  const { teamId, date, time, location, description, duration } = await req.json();

  if (!teamId || !date || !time) {
    throw new Error('Missing required fields');
  }

  // Проверка прав
  const team = await teamService.getTeamById(user.id, teamId);
  if (team.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  const gameDate = parseMoscowDateTime(date, time);

  // Создаем игру
  const game = await gameService.createGame(
    teamId,
    gameDate,
    location,
    description,
    duration !== undefined ? Number(duration) : undefined
  );

  // Отправляем сообщение в Telegram
  if (team.telegram_chat_id) {
    await gameMessageBuilder.sendGameMessage(team.telegram_chat_id, game);
  }

  return { game };
});
