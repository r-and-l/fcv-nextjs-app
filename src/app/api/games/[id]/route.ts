import { withTelegramAuth } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = withTelegramAuth(async (req, user, context: any) => {
  const params = await context.params;
  const gameId = params.id;
  
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: {
      registrations: {
        include: { user: true }
      },
      lineups: true,
      mini_games: {
        include: {
          home_lineup: true,
          away_lineup: true
        }
      }
    }
  });

  return { game };
});

export const PATCH = withTelegramAuth(async (req, user, context: any) => {
  const params = await context.params;
  const gameId = params.id;
  const { duration } = await req.json();

  if (duration === undefined) throw new Error('Missing duration');

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
    throw new Error('Access denied: only ADMIN can modify game duration');
  }

  const now = new Date();
  const gameEndTime = new Date(game.date.getTime() + (game.duration || 60) * 60 * 1000);
  if (now > gameEndTime) {
    throw new Error('Access denied: cannot change duration of a finished game');
  }

  const updatedGame = await prisma.game.update({
    where: { id: gameId },
    data: { duration: Number(duration) }
  });

  return { game: updatedGame };
});
