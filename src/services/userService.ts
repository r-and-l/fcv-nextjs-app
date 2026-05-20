import { prisma } from '@/lib/prisma';
import { User } from '@/types/user';
import { TelegramUser } from '@/types/telegram';

// Prisma возвращает `id` как BigInt, который стандартный JSON.stringify не умеет сериализовать.
// Поэтому мы преобразуем его обратно в обычный JS Number, который отлично вмещает ID из Telegram.
const mapPrismaUser = (user: any): User => ({
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
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
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
          first_name: tgUser.first_name || null,
          last_name: tgUser.last_name || null,
        },
        create: {
          id: BigInt(tgUser.id),
          username: tgUser.username || null,
          first_name: tgUser.first_name || null,
          last_name: tgUser.last_name || null,
        }
      });
      return mapPrismaUser(user);
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
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
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
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

      for (const lp of lineupPlayers) {
        const playerLineup = lp.lineup;
        const game = playerLineup.game;

        // Считаем только игры, в которых ровно 2 состава
        if (game.lineups.length === 2) {
          const l1 = game.lineups[0];
          const l2 = game.lineups[1];

          const score1 = l1.score ?? 0;
          const score2 = l2.score ?? 0;

          // Определяем, в каком составе был игрок
          const isL1 = playerLineup.id === l1.id;
          const playerScore = isL1 ? score1 : score2;
          const opponentScore = isL1 ? score2 : score1;

          // Проверим, закончилась ли игра (с учетом duration)
          const gameEndTime = new Date(game.date.getTime() + (game.duration || 60) * 60 * 1000);
          if (now < gameEndTime) {
            // Игра еще идет, не считаем в статистику
            continue;
          }

          if (playerScore > opponentScore) {
            wins++;
          } else if (playerScore < opponentScore) {
            losses++;
          } else {
            draws++;
          }
        }
      }

      return { wins, losses, draws };
    } catch (error: any) {
      throw new Error(`getUserStats error: ${error.message}`);
    }
  }
};
