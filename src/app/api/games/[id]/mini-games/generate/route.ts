import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';
import { prisma } from '@/lib/prisma';
import { RouteContext } from '@/types';

export const POST = withTelegramAuth(async (req, user, context: RouteContext) => {
  const params = await context.params;
  const gameId = params.id as string;

  const game = await prisma.game.findUnique({
    where: { id: gameId }
  });
  if (!game) throw new Error('Game not found');

  const member = await prisma.teamMember.findUnique({
    where: {
      user_id_team_id: {
        user_id: BigInt(user.id),
        team_id: game.team_id
      }
    }
  });

  if (!member || member.role !== 'ADMIN') {
    throw new Error('Access denied: only ADMIN can generate matches');
  }

  const miniGames = await gameService.generateMiniGames(gameId);
  return { miniGames };
});
