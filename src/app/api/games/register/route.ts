import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';
import { gameMessageBuilder } from '@/lib/gameMessageBuilder';

export const POST = withTelegramAuth(async (req, user) => {
  const { gameId, status } = await req.json();
  if (!gameId || !status) throw new Error('Missing gameId or status');

  const registration = await gameService.registerForGame(gameId, user.id, status);
  
  try {
    await gameMessageBuilder.updateGameMessage(gameId);
  } catch (err) {
    console.error('Failed to update telegram message on registration:', err);
  }

  return { success: true, registration };
});
