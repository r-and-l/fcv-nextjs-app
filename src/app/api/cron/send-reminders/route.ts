import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/services/gameService';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const sentCount = await gameService.sendUpcomingReminders();
    return NextResponse.json({ success: true, sentRemindersCount: sentCount });
  } catch (error: any) {
    console.error('Cron Reminders Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
