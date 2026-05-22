import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';
import { prisma } from '@/lib/prisma';
import { gameMessageBuilder } from '@/lib/gameMessageBuilder';
import { RouteContext } from '@/types';

export const POST = withTelegramAuth(async (req, user, context: RouteContext) => {
  const params = await context.params;
  const gameId = params.id as string;
  const { name } = await req.json();

  if (!name || !name.trim()) {
    throw new Error('Name is required');
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
    throw new Error('Forbidden: Only ADMIN can add legioneers');
  }

  // 3. Генерируем уникальный отрицательный ID для легионера
  let guestId = 0;
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 10) {
    const candidate = -1 * (Date.now() * 1000 + Math.floor(Math.random() * 1000));
    const existing = await prisma.user.findUnique({
      where: { id: BigInt(candidate) }
    });
    if (!existing) {
      guestId = candidate;
      isUnique = true;
    }
    attempts++;
  }
  if (!isUnique) {
    throw new Error('Failed to generate unique guest ID');
  }

  // 4. Создаем пользователя-легионера
  const guestUser = await prisma.user.create({
    data: {
      id: BigInt(guestId),
      first_name: name.trim(),
      username: `guest_${guestId}`
    }
  });

  // 5. Записываем легионера на игру как "Идет"
  const registration = await gameService.registerForGame(gameId, guestId, 'GOING');

  // 6. Обновляем сообщение в Telegram (асинхронно)
  try {
    await gameMessageBuilder.updateGameMessage(gameId);
  } catch (err) {
    console.error('[Legioneer] Failed to update Telegram message:', err);
  }

  return { success: true, user: guestUser, registration };
});
