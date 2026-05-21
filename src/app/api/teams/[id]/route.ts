import { withTelegramAuth } from '@/lib/api-handler';
import { teamService } from '@/services/teamService';

export const GET = withTelegramAuth(async (req, user, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  const team = await teamService.getTeamById(user.id, params.id);
  return { team };
});

export const PATCH = withTelegramAuth(async (req, user, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  const { default_reminder_hours, default_reminder_text, game_announce_hours } = await req.json();
  const team = await teamService.updateTeamSettings(user.id, params.id, {
    default_reminder_hours: default_reminder_hours !== undefined ? (default_reminder_hours === null ? null : Number(default_reminder_hours)) : undefined,
    default_reminder_text: default_reminder_text !== undefined ? default_reminder_text : undefined,
    game_announce_hours: game_announce_hours !== undefined ? (game_announce_hours === null ? null : Number(game_announce_hours)) : undefined,
  });
  return { team };
});
