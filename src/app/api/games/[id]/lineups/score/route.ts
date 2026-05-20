import { withTelegramAuth } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const PATCH = withTelegramAuth(async (req, user) => {
  const { lineupId, score } = await req.json();

  if (!lineupId) throw new Error('Missing lineupId');
  if (score === undefined) throw new Error('Missing score');

  // Получаем lineup и игру для проверки времени
  const targetLineup = await prisma.gameLineup.findUnique({
    where: { id: lineupId },
    include: { game: true }
  });
  if (!targetLineup) throw new Error('Lineup not found');

  const game = targetLineup.game;
  const now = new Date();
  const gameEndTime = new Date(game.date.getTime() + (game.duration || 60) * 60 * 1000);
  const isFinished = now > gameEndTime;

  // Проверяем роль пользователя в команде
  const member = await prisma.teamMember.findUnique({
    where: {
      user_id_team_id: {
        user_id: BigInt(user.id),
        team_id: game.team_id
      }
    }
  });

  if (!member) {
    throw new Error('Access denied: not a team member');
  }

  // Если игра завершена, изменять счет может только ADMIN
  if (isFinished && member.role !== 'ADMIN') {
    throw new Error('Access denied: only ADMIN can change the score after the game is finished');
  }

  const lineup = await prisma.gameLineup.update({
    where: { id: lineupId },
    data: { score: score === null || score === '' ? null : Number(score) }
  });

  return { lineup };
});
