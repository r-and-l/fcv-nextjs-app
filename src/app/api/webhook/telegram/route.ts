import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gameService } from '@/services/gameService';
import { userService } from '@/services/userService';
import { teamService } from '@/services/teamService';
import { gameMessageBuilder } from '@/lib/gameMessageBuilder';
import { MyTeam } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Сценарий 1: Пользователь отправляет команду /start в личку боту
    if (update.message && update.message.text?.startsWith('/start')) {
      const tgUser = update.message.from;
      
      if (tgUser && !tgUser.is_bot) {
        // Сохраняем пользователя в БД через сервис
        await userService.upsertUser(tgUser);
        console.log(`[Webhook] User ${tgUser.id} registered via /start`);

        const { telegramApi } = await import('@/lib/telegramApi');
        const botInfo = await telegramApi.getMe();
        const botUsername = botInfo?.result?.username || 'fcv_app_bot';
        const shortName = process.env.NEXT_PUBLIC_MINI_APP_SHORT_NAME || 'app';

        // Проверяем, есть ли у пользователя команды
        const userTeams = await teamService.getMyTeams(tgUser.id);

        if (userTeams.length > 0) {
          // У пользователя уже есть команда(ы) — показываем их со ссылками
          const teamLines = userTeams.map((t: MyTeam, i: number) => {
            return `${i + 1}. <b>${t.name || 'Без названия'}</b>`;
          }).join('\n');

          const welcomeText = `👋 <b>С возвращением!</b>\n\n` +
            `Вы уже состоите в ${userTeams.length === 1 ? 'команде' : 'командах'}:\n${teamLines}\n\n` +
            `Нажмите кнопку ниже, чтобы открыть приложение.\n` +
            `Или добавьте меня в другую группу, чтобы создать новую команду.`;

          // Кнопки: открыть приложение (каждую команду) + добавить в группу
          const teamButtons = userTeams.map((t: MyTeam) => ([{
            text: `⚽ ${t.name || 'Команда'}`,
            url: `https://t.me/${botUsername}/${shortName}?startapp=${t.id}`
          }]));

          const markup = {
            inline_keyboard: [
              ...teamButtons,
              [{ text: '➕ Добавить в другую группу', url: `https://t.me/${botUsername}?startgroup=true` }]
            ]
          };

          await telegramApi.sendMessage(update.message.chat.id, welcomeText, markup);
        } else {
          // Новый пользователь — показываем инструкции
          const welcomeText = `👋 <b>Привет! Я бот для управления футбольными сборами.</b>\n\n` +
            `Я помогу вашей команде организовывать игры, собирать составы, вести статистику и турнирную таблицу прямо в Telegram!\n\n` +
            `⚙️ <b>Как начать работу:</b>\n` +
            `1. Добавьте меня в <b>группу вашей команды</b>.\n` +
            `2. <b>Назначьте меня администратором</b> группы — это нужно для отправки и закрепления сообщений об играх.\n` +
            `3. После добавления я автоматически создам команду и пришлю ссылку на приложение.\n\n` +
            `<i>Удачных сборов!</i> ⚽`;

          const markup = {
            inline_keyboard: [
              [{ text: '➕ Добавить бота в группу', url: `https://t.me/${botUsername}?startgroup=true` }]
            ]
          };

          await telegramApi.sendMessage(update.message.chat.id, welcomeText, markup);
        }
      }
    }

    // Сценарий 2: Бота добавили в группу
    if (update.my_chat_member) {
      const { chat, new_chat_member, from } = update.my_chat_member;

      // Проверяем, что это группа/супергруппа и статус 'member' или 'administrator'
      if ((chat.type === 'group' || chat.type === 'supergroup') && 
          (new_chat_member.status === 'member' || new_chat_member.status === 'administrator')) {
        
        // 1. Сохраняем пользователя, который добавил бота, через сервис
        if (from && !from.is_bot) {
          await userService.upsertUser(from);
        }

        // 2. Создаем или обновляем команду с ID этого чата через сервис
        const team = await teamService.upsertTeamFromChat(chat.id, chat.title || 'Новая команда');

        // 3. Связываем пользователя (from) с командой как ADMIN через сервис
        if (from && !from.is_bot) {
          await teamService.assignAdminToTeam(from.id, team.id);
          console.log(`[Webhook] User ${from.id} assigned as ADMIN to Team ${team.id}`);
        }

        // 4. Отправляем приветственное сообщение в группу с кнопкой — ссылка ведет сразу на страницу команды
        const { telegramApi } = await import('@/lib/telegramApi');
        const botInfo = await telegramApi.getMe();
        const botUsername = botInfo?.result?.username || 'fcv_app_bot';
        const shortName = process.env.NEXT_PUBLIC_MINI_APP_SHORT_NAME || 'app';
        const appUrl = `https://t.me/${botUsername}/${shortName}?startapp=${team.id}`;

        const text = `🎉 <b>Привет! Я бот для управления футбольными сборами.</b>\n\n` +
          `Команда «<b>${team.name}</b>» успешно создана!\n\n` +
          `Нажмите кнопку ниже, чтобы открыть приложение и перейти на страницу команды.`;
        const markup = {
          inline_keyboard: [
            [{ text: '⚽ Открыть команду', url: appUrl }]
          ]
        };

        await telegramApi.sendMessage(chat.id, text, markup);

        console.log(`[Webhook] Team created/updated for chat ${chat.id}: ${team.name} (Team UUID: ${team.id})`);
      }
    }

    // Сценарий 3: Нажатие на Inline кнопку
    if (update.callback_query) {
      const query = update.callback_query;
      const data = query.data; // "game_go_123" или "game_notgo_123"
      const from = query.from;

      if (data && data.startsWith('game_') && from) {
        // Убедимся, что юзер есть в БД через сервис
        await userService.upsertUser(from);

        const parts = data.split('_');
        if (parts.length >= 3) {
          const action = parts[1]; // 'go' или 'notgo'
          const gameId = parts.slice(2).join('_'); // id может содержать дефисы (UUID)
          const status = action === 'go' ? 'GOING' : 'NOT_GOING';

          // Находим игру, чтобы узнать команду
          const game = await prisma.game.findUnique({ where: { id: gameId } });
          
          if (game) {
            // Добавляем юзера в участники команды, если его там еще нет
            await teamService.ensureTeamMembership(from.id, game.team_id);
          }

          // Регистрируем на игру
          await gameService.registerForGame(gameId, from.id, status);

          // Обновляем сообщение в группе
          await gameMessageBuilder.updateGameMessage(gameId);

          // Отвечаем Telegram, чтобы убрать индикатор загрузки на кнопке
          const token = process.env.TELEGRAM_BOT_TOKEN;
          await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: query.id, text: 'Голос учтен!' })
          });
        }
      }
    }

    // Telegram всегда ждет 200 OK, иначе будет повторять запрос
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Webhook] Error processing update:', error);
    // Все равно возвращаем 200, чтобы Telegram не спамил ретраями из-за наших внутренних ошибок
    return NextResponse.json({ ok: true });
  }
}
