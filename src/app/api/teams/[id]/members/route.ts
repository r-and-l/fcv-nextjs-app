import { withTelegramAuth } from '@/lib/api-handler';
import { teamService } from '@/services/teamService';
import { RouteContext } from '@/types';

export const GET = withTelegramAuth(async (req, user, context: RouteContext) => {
  const params = await context.params;
  const teamId = params.id as string;
  const members = await teamService.getMembers(user.id, teamId);
  return { members };
});

export const PATCH = withTelegramAuth(async (req, user, context: RouteContext) => {
  const params = await context.params;
  const teamId = params.id as string;
  const { targetUserId, newRole } = await req.json();
  
  if (!targetUserId || !newRole) {
    throw new Error('Missing targetUserId or newRole');
  }

  const updatedMember = await teamService.updateMemberRole(user.id, teamId, targetUserId, newRole);
  return { member: updatedMember };
});
