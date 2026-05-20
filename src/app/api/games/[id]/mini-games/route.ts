import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';
import { prisma } from '@/lib/prisma';

export const GET = withTelegramAuth(async (req, user, context: any) => {
  const params = await context.params;
  const gameId = params.id;
  const miniGames = await gameService.getMiniGames(gameId);
  return { miniGames };
});

export const PATCH = withTelegramAuth(async (req, user) => {
  const { miniGameId, homeScore, awayScore } = await req.json();

  if (!miniGameId) throw new Error('Missing miniGameId');

  const miniGame = await prisma.miniGame.findUnique({
    where: { id: miniGameId },
    include: { game: true }
  });
  if (!miniGame) throw new Error('Mini game not found');

  const game = miniGame.game;
  const now = new Date();
  const gameEndTime = new Date(game.date.getTime() + (game.duration || 60) * 60 * 1000);
  const isFinished = now > gameEndTime;

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

  if (isFinished) {
    if (member.role !== 'ADMIN') {
      throw new Error('Access denied: only ADMIN can change score after the game is finished');
    }
  }

  const updated = await gameService.updateMiniGameScore(
    miniGameId,
    homeScore === null || homeScore === '' ? null : Number(homeScore),
    awayScore === null || awayScore === '' ? null : Number(awayScore)
  );

  return { miniGame: updated };
});
