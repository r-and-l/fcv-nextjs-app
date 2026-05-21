import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';
import { prisma } from '@/lib/prisma';
import { gameMessageBuilder } from '@/lib/gameMessageBuilder';

export const POST = withTelegramAuth(async (req, user, context: any) => {
  const params = await context.params;
  const gameId = params.id;
  const { userId, status } = await req.json();

  if (!userId || !status) {
    throw new Error('Missing userId or status');
  }

  // 1. Получаем игру для проверки ID команды
  const game = await prisma.game.findUnique({
    where: { id: gameId }
  });

  if (!game) {
    throw new Error('Game not found');
  }

  // 2. Проверяем, что запрашивающий пользователь является админом в этой команде
  const member = await prisma.teamMember.findUnique({
    where: {
      user_id_team_id: {
        user_id: BigInt(user.id),
        team_id: game.team_id
      }
    }
  });

  if (!member || member.role !== 'ADMIN') {
    throw new Error('Forbidden: Only ADMIN can manually register other players');
  }

  // 3. Записываем выбранного пользователя на игру
  const registration = await gameService.registerForGame(gameId, Number(userId), status);

  // 4. Обновляем сообщение в Telegram (асинхронно, с логированием ошибок)
  try {
    await gameMessageBuilder.updateGameMessage(gameId);
  } catch (err) {
    console.error('[AdminRegister] Failed to update Telegram message:', err);
  }

  return { success: true, registration };
});
