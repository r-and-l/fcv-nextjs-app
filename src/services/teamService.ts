import { prisma } from '@/lib/prisma';
import { TelegramUser } from '@/types/telegram';
import { userService } from './userService';

export const teamService = {
  async getMyTeams(userId: number) {
    const teamMembers = await prisma.teamMember.findMany({
      where: { user_id: BigInt(userId) },
      include: { team: true },
      orderBy: { created_at: 'desc' }
    });

    return teamMembers.map(tm => ({
      ...tm.team,
      role: tm.role
    }));
  },

  async getTeamById(userId: number, teamId: string) {
    const teamMember = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(userId), team_id: teamId } },
      include: { team: true }
    });

    if (!teamMember) throw new Error('Not a member');

    return { ...teamMember.team, role: teamMember.role };
  },

  async joinTeam(tgUser: TelegramUser, teamId: string) {
    // 1. Убедимся, что пользователь есть в БД
    await userService.upsertUser(tgUser);

    // 2. Добавим пользователя в команду
    return await prisma.teamMember.upsert({
      where: {
        user_id_team_id: {
          user_id: BigInt(tgUser.id),
          team_id: teamId
        }
      },
      update: {}, // Если уже есть, ничего не делаем
      create: {
        user_id: BigInt(tgUser.id),
        team_id: teamId,
        role: 'MEMBER'
      }
    });
  },

  async getSchedules(teamId: string) {
    return await prisma.teamSchedule.findMany({
      where: { team_id: teamId },
      orderBy: { day_of_week: 'asc' }
    });
  },

  async createSchedule(userId: number, teamId: string, dayOfWeek: number, time: string, location: string, duration: number = 60, latitude?: number, longitude?: number) {
    const member = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(userId), team_id: teamId } }
    });

    if (!member || member.role !== 'ADMIN') {
      throw new Error('Forbidden');
    }

    return await prisma.teamSchedule.create({
      data: {
        team_id: teamId,
        day_of_week: dayOfWeek,
        time,
        location,
        latitude,
        longitude,
        duration
      }
    });
  },

  async deleteSchedule(userId: number, teamId: string, scheduleId: string) {
    const member = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(userId), team_id: teamId } }
    });

    if (!member || member.role !== 'ADMIN') {
      throw new Error('Forbidden');
    }

    await prisma.teamSchedule.delete({
      where: { id: scheduleId }
    });
  },

  async getMembers(userId: number, teamId: string) {
    // Проверка, что юзер состоит в команде
    const member = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(userId), team_id: teamId } }
    });

    if (!member) throw new Error('Forbidden');

    const members = await prisma.teamMember.findMany({
      where: { team_id: teamId },
      include: { user: true },
      orderBy: { created_at: 'asc' }
    });

    return members.map(m => ({
      ...m,
      user_id: Number(m.user_id)
    }));
  },

  async updateMemberRole(userId: number, teamId: string, targetUserId: number, newRole: any) {
    const adminMember = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(userId), team_id: teamId } }
    });

    if (!adminMember || adminMember.role !== 'ADMIN') {
      throw new Error('Forbidden');
    }

    return await prisma.teamMember.update({
      where: { user_id_team_id: { user_id: BigInt(targetUserId), team_id: teamId } },
      data: { role: newRole }
    });
  },

  async upsertTeamFromChat(chatId: number | bigint, name: string) {
    return await prisma.team.upsert({
      where: { telegram_chat_id: BigInt(chatId) },
      update: { name },
      create: {
        telegram_chat_id: BigInt(chatId),
        name
      }
    });
  },

  async assignAdminToTeam(userId: number | bigint, teamId: string) {
    return await prisma.teamMember.upsert({
      where: {
        user_id_team_id: {
          user_id: BigInt(userId),
          team_id: teamId
        }
      },
      update: {
        role: 'ADMIN'
      },
      create: {
        user_id: BigInt(userId),
        team_id: teamId,
        role: 'ADMIN'
      }
    });
  },

  async ensureTeamMembership(userId: number | bigint, teamId: string) {
    return await prisma.teamMember.upsert({
      where: {
        user_id_team_id: {
          user_id: BigInt(userId),
          team_id: teamId
        }
      },
      update: {},
      create: {
        user_id: BigInt(userId),
        team_id: teamId,
        role: 'MEMBER'
      }
    });
  },

  async updateTeamSettings(userId: number, teamId: string, settings: { default_reminder_hours?: number | null, default_reminder_text?: string | null, game_announce_hours?: number | null }) {
    const adminMember = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(userId), team_id: teamId } }
    });

    if (!adminMember || adminMember.role !== 'ADMIN') {
      throw new Error('Forbidden');
    }

    return await prisma.team.update({
      where: { id: teamId },
      data: settings
    });
  }
};
