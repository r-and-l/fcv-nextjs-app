import { prisma } from '@/lib/prisma';
import { User } from '@/types/user';
import { TelegramUser } from '@/types/telegram';
import { User as PrismaUser } from '@prisma/client';

// Prisma возвращает `id` как BigInt, который стандартный JSON.stringify не умеет сериализовать.
// Поэтому мы преобразуем его обратно в обычный JS Number, который отлично вмещает ID из Telegram.
const mapPrismaUser = (user: PrismaUser): User => ({
  id: Number(user.id),
  username: user.username,
  first_name: user.first_name,
  last_name: user.last_name,
  created_at: user.created_at?.toISOString()
});

export const userService = {
  /**
   * Возвращает список всех пользователей
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { created_at: 'desc' }
      });
      return users.map(mapPrismaUser);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Prisma error: ${msg}`);
    }
  },

  /**
   * Сохраняет или обновляет профиль пользователя
   */
  async upsertUser(tgUser: TelegramUser): Promise<User> {
    try {
      const user = await prisma.user.upsert({
        where: { id: BigInt(tgUser.id) },
        update: {
          username: tgUser.username || null,
          // Не перезаписываем имя и фамилию при обновлении, чтобы сохранить кастомный профиль
        },
        create: {
          id: BigInt(tgUser.id),
          username: tgUser.username || null,
          first_name: tgUser.first_name || null,
          last_name: tgUser.last_name || null,
        }
      });
      return mapPrismaUser(user);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Prisma error: ${msg}`);
    }
  },

  /**
   * Удаляет пользователя по ID
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id: BigInt(userId) }
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Prisma error: ${msg}`);
    }
  },

  /**
   * Вычисляет спортивную статистику игрока (победы, поражения, ничьи)
   */
  async getUserStats(userId: number) {
    try {
      const now = new Date();
      // Находим все записи игрока в составах прошедших игр
      const lineupPlayers = await prisma.lineupPlayer.findMany({
        where: {
          user_id: BigInt(userId),
          lineup: {
            game: {
              date: { lt: now } // Прошедшие игры
            }
          }
        },
        include: {
          lineup: {
            include: {
              game: {
                include: {
                  lineups: true
                }
              }
            }
          }
        }
      });

      let wins = 0;
      let losses = 0;
      let draws = 0;

      // Извлекаем ID игр с 3+ составами, чтобы загрузить мини-игры одним запросом
      const tournamentGameIds = lineupPlayers
        .map(lp => lp.lineup.game)
        .filter(g => g.lineups.length >= 3)
        .map(g => g.id);

      const allMiniGames = tournamentGameIds.length > 0 
        ? await prisma.miniGame.findMany({
            where: {
              game_id: { in: tournamentGameIds }
            }
          })
        : [];

      for (const lp of lineupPlayers) {
        const playerLineup = lp.lineup;
        const game = playerLineup.game;

        // Проверим, закончилась ли игра (с учетом duration)
        const gameEndTime = new Date(game.date.getTime() + (game.duration || 60) * 60 * 1000);
        if (now < gameEndTime) {
          // Игра еще идет, не считаем в статистику
          continue;
        }

        // Считаем обычные игры (ровно 2 состава)
        if (game.lineups.length === 2) {
          const l1 = game.lineups[0];
          const l2 = game.lineups[1];

          // Если счет не заполнен, не считаем в статистику
          if (l1.score === null || l2.score === null) {
            continue;
          }

          const score1 = l1.score;
          const score2 = l2.score;

          // Определяем, в каком составе был игрок
          const isL1 = playerLineup.id === l1.id;
          const playerScore = isL1 ? score1 : score2;
          const opponentScore = isL1 ? score2 : score1;

          if (playerScore > opponentScore) {
            wins++;
          } else if (playerScore < opponentScore) {
            losses++;
          } else {
            draws++;
          }
        } 
        // Считаем турнирные мини-игры (3+ состава)
        else if (game.lineups.length >= 3) {
          const myMiniGames = allMiniGames.filter(
            mg => mg.game_id === game.id && 
            (mg.home_lineup_id === playerLineup.id || mg.away_lineup_id === playerLineup.id)
          );

          for (const mg of myMiniGames) {
            if (mg.home_score === null || mg.away_score === null) {
              continue;
            }

            const isHome = mg.home_lineup_id === playerLineup.id;
            const playerScore = isHome ? mg.home_score : mg.away_score;
            const opponentScore = isHome ? mg.away_score : mg.home_score;

            if (playerScore > opponentScore) {
              wins++;
            } else if (playerScore < opponentScore) {
              losses++;
            } else {
              draws++;
            }
          }
        }
      }

      return { wins, losses, draws };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`getUserStats error: ${msg}`);
    }
  }
};

