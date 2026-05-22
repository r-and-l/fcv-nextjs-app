import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/services/gameService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sentCount = await gameService.sendUpcomingReminders();
    return NextResponse.json({ success: true, sentRemindersCount: sentCount });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Cron Reminders Error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
