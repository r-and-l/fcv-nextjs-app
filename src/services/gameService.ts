import { prisma } from '@/lib/prisma';
import { gameMessageBuilder } from '@/lib/gameMessageBuilder';
import {
  addDaysToDateString,
  getMoscowDateString,
  getMoscowWeekday,
  parseMoscowDateTime,
} from '@/lib/timezone';

export const gameService = {
  /**
   * Создает новую игру для команды
   */
  async createGame(teamId: string, date: Date, location?: string, description?: string, duration?: number) {
    try {
      const game = await prisma.game.create({
        data: {
          team_id: teamId,
          date,
          location,
          description,
          ...(duration !== undefined ? { duration } : {}),
        }
      });

      // Автоматически создаем 2 состава для новой игры
      await this.createDefaultLineup(game.id);

      return game;
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  },

  /**
   * Удаляет игру и связанное с ней сообщение в Telegram
   */
  async deleteGame(gameId: string, teamId: string) {
    try {
      // Сначала получаем игру, чтобы узнать ID сообщения
      const game = await prisma.game.findFirst({
        where: { id: gameId, team_id: teamId },
        include: { team: true }
      });

      if (!game) {
        throw new Error('Game not found or access denied');
      }

      // Удаляем игру из БД (каскадно удалятся и регистрации)
      await prisma.game.delete({
        where: { id: gameId }
      });

      // Если есть сообщение в Telegram, пытаемся его удалить
      if (game.telegram_message_id && game.team?.telegram_chat_id) {
        try {
          const { telegramApi } = await import('@/lib/telegramApi');
          await telegramApi.deleteMessage(game.team.telegram_chat_id, game.telegram_message_id);
        } catch (err) {
          console.error('Failed to delete Telegram message:', err);
          // Игнорируем ошибку удаления сообщения, главное что игра удалена из БД
        }
      }

      return true;
    } catch (error: any) {
      throw new Error(`Delete game error: ${error.message}`);
    }
  },

  /**
   * Возвращает будущие игры для команды
   */
  async getUpcomingGames(teamId: string) {
    try {
      return await prisma.game.findMany({
        where: {
          team_id: teamId,
          date: { gte: new Date() } // Только будущие
        },
        orderBy: { date: 'asc' },
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
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  },

  /**
   * Возвращает прошедшие игры для команды с результатами
   */
  async getPastGames(teamId: string) {
    try {
      return await prisma.game.findMany({
        where: {
          team_id: teamId,
          date: { lt: new Date() } // Только прошедшие
        },
        orderBy: { date: 'desc' },
        include: {
          lineups: true,
          registrations: {
            include: { user: true }
          },
          mini_games: {
            include: {
              home_lineup: true,
              away_lineup: true
            }
          }
        }
      });
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  },

  /**
   * Запись пользователя на игру (Идет / Не идет)
   */
  async registerForGame(gameId: string, userId: number, status: 'GOING' | 'NOT_GOING' | 'MAYBE') {
    try {
      // Удаляем из составов, если статус не GOING
      if (status !== 'GOING') {
        const lineups = await prisma.gameLineup.findMany({ where: { game_id: gameId } });
        const lineupIds = lineups.map((l: any) => l.id);
        if (lineupIds.length > 0) {
          await prisma.lineupPlayer.deleteMany({
            where: {
              user_id: BigInt(userId),
              lineup_id: { in: lineupIds }
            }
          });
        }
      }

      return await prisma.gameRegistration.upsert({
        where: {
          game_id_user_id: {
            game_id: gameId,
            user_id: BigInt(userId)
          }
        },
        update: { status },
        create: {
          game_id: gameId,
          user_id: BigInt(userId),
          status
        }
      });
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  },

  /**
   * Генерирует игры по расписанию на ближайшие 7 дней
   * @param teamId Опционально: сгенерировать только для конкретной команды
   */
  async generateMissingGames(teamId?: string) {
    try {
      const today = new Date();
      const todayMoscow = getMoscowDateString(today);
      // Получаем расписание (для одной команды или для всех)
      const schedules = await prisma.teamSchedule.findMany({
        where: teamId ? { team_id: teamId } : undefined,
        include: { team: true }
      });

      let createdCount = 0;

      for (const schedule of schedules) {
        // Проверяем следующие 7 дней (календарь — Москва)
        for (let i = 1; i <= 7; i++) {
          const targetDateStr = addDaysToDateString(todayMoscow, i);

          if (getMoscowWeekday(parseMoscowDateTime(targetDateStr, '12:00')) === schedule.day_of_week) {
            const gameDate = parseMoscowDateTime(targetDateStr, schedule.time);

            // Создаем игру только если до нее осталось менее 72 часов (ровно 3 суток)
            const hoursUntilGame = (gameDate.getTime() - today.getTime()) / (1000 * 60 * 60);
            
            if (hoursUntilGame <= 72 && hoursUntilGame > 0) {
              // Проверяем, существует ли уже игра на эту дату (с погрешностью +- 1 час)
              const existingGame = await prisma.game.findFirst({
                where: {
                  team_id: schedule.team_id,
                  date: {
                    gte: new Date(gameDate.getTime() - 1000 * 60 * 60),
                    lte: new Date(gameDate.getTime() + 1000 * 60 * 60),
                  }
                }
              });

              if (!existingGame) {
                const newGame = await prisma.game.create({
                  data: {
                    team_id: schedule.team_id,
                    date: gameDate,
                    location: schedule.location,
                    duration: schedule.duration,
                    description: 'Автоматически созданная игра по расписанию'
                  }
                });

                // Создаем 2 состава
                await this.createDefaultLineup(newGame.id);

                // Отправляем анонс в Telegram группу
                if (schedule.team.telegram_chat_id) {
                  await gameMessageBuilder.sendGameMessage(schedule.team.telegram_chat_id, newGame);
                }

                createdCount++;
              }
            }
          }
        }
      }
      return createdCount;
    } catch (error: any) {
      console.error('generateMissingGames error:', error);
      throw new Error(`Generate Games Error: ${error.message}`);
    }
  },

  /**
   * Получить составы игры
   */
  async getGameLineups(gameId: string) {
    return await prisma.gameLineup.findMany({
      where: { game_id: gameId },
      include: {
        players: {
          include: { user: true }
        }
      },
      orderBy: { created_at: 'asc' }
    });
  },

  /**
 * Создать 2 дефолтных состава
 */
  async createDefaultLineup(gameId: string) {
    return await prisma.gameLineup.createMany({
      data: [
        { game_id: gameId, name: 'Красные', score: 0 },
        { game_id: gameId, name: 'Зелёные', score: 0 }
      ]
    });
  },

  /**
   * Создать новый состав (например, "Команда 3")
   */
  async createLineup(gameId: string, name: string) {
    return await prisma.gameLineup.create({
      data: {
        game_id: gameId,
        name,
        score: 0
      }
    });
  },

  /**
   * Удалить состав
   */
  async deleteLineup(lineupId: string) {
    return await prisma.gameLineup.delete({
      where: { id: lineupId }
    });
  },

  /**
   * Назначить игрока в состав
   */
  async assignPlayerToLineup(lineupId: string, userId: number, gameId: string) {
    // Сначала удаляем игрока из всех других составов этой игры
    const lineups = await prisma.gameLineup.findMany({ where: { game_id: gameId } });
    const lineupIds = lineups.map((l: any) => l.id);

    await prisma.lineupPlayer.deleteMany({
      where: {
        user_id: BigInt(userId),
        lineup_id: { in: lineupIds }
      }
    });

    // Теперь добавляем в нужный состав
    return await prisma.lineupPlayer.create({
      data: {
        lineup_id: lineupId,
        user_id: BigInt(userId)
      }
    });
  },

  /**
   * Убрать игрока из состава
   */
  async removePlayerFromLineup(lineupId: string, userId: number) {
    return await prisma.lineupPlayer.deleteMany({
      where: {
        lineup_id: lineupId,
        user_id: BigInt(userId)
      }
    });
  },

  /**
   * Получить мини-игры для турнира (3+ составов)
   */
  async getMiniGames(gameId: string) {
    try {
      return await prisma.miniGame.findMany({
        where: { game_id: gameId },
        orderBy: { created_at: 'asc' },
        include: {
          home_lineup: true,
          away_lineup: true
        }
      });
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  },

  /**
   * Сгенерировать матчи кругового турнира
   */
  async generateMiniGames(gameId: string) {
    try {
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: { lineups: true }
      });
      if (!game) throw new Error('Game not found');

      const N = game.lineups.length;
      if (N < 3) {
        throw new Error('Для турнира требуется не менее 3 составов');
      }

      // Количество матчей в одном круге: N * (N - 1) / 2
      const matchesPerCircle = (N * (N - 1)) / 2;
      const matchDuration = 10; // 10 минут на мини-игру
      const circleDuration = matchesPerCircle * matchDuration;

      // Рассчитываем количество полных кругов
      const circles = Math.max(1, Math.floor(game.duration / circleDuration));

      // Генерируем уникальные пары
      const pairs: { homeIdx: number; awayIdx: number }[] = [];
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          pairs.push({ homeIdx: i, awayIdx: j });
        }
      }

      const matchesToCreate = [];
      for (let circle = 0; circle < circles; circle++) {
        for (const pair of pairs) {
          // Чередуем хозяев и гостей для разнообразия
          const home = circle % 2 === 0 ? pair.homeIdx : pair.awayIdx;
          const away = circle % 2 === 0 ? pair.awayIdx : pair.homeIdx;
          matchesToCreate.push({
            game_id: gameId,
            home_lineup_id: game.lineups[home].id,
            away_lineup_id: game.lineups[away].id,
            home_score: null,
            away_score: null
          });
        }
      }

      // Сбрасываем старые игры
      await prisma.miniGame.deleteMany({
        where: { game_id: gameId }
      });

      // Создаем новые
      await prisma.miniGame.createMany({
        data: matchesToCreate
      });

      return await this.getMiniGames(gameId);
    } catch (error: any) {
      throw new Error(`Failed to generate tournament matches: ${error.message}`);
    }
  },

  /**
   * Обновить счет мини-игры
   */
  async updateMiniGameScore(miniGameId: string, homeScore: number | null, awayScore: number | null) {
    try {
      return await prisma.miniGame.update({
        where: { id: miniGameId },
        data: {
          home_score: homeScore,
          away_score: awayScore
        }
      });
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  }
};
