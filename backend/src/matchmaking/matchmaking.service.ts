import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsService } from '../rooms/rooms.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MatchmakingService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => RoomsService))
        private readonly roomsService: RoomsService
    ) { }

    async findRivals(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true, goals: { where: { isActive: true } } },
        });
        if (!user) return [];

        const userGoalCategories = user.goals.map(g => g.category);
        const userSkillLevel = user.profile?.skillLevel || 'beginner';

        // Find users with similar goals & skill level
        const candidates = await this.prisma.user.findMany({
            where: {
                id: { not: userId },
                goals: { some: { category: { in: userGoalCategories }, isActive: true } },
            },
            include: {
                profile: true,
                goals: { where: { isActive: true } },
                _count: { select: { participants: true } },
            },
            take: 20,
        });

        // Score & rank
        return candidates
            .map(c => {
                let score = 0;
                const sharedGoals = c.goals.filter(g => userGoalCategories.includes(g.category));
                score += sharedGoals.length * 30;
                if (c.profile?.skillLevel === userSkillLevel) score += 25;
                const levelDiff = this.levelDistance(userSkillLevel, c.profile?.skillLevel || 'beginner');
                score -= levelDiff * 10;
                score += Math.min((c._count.participants || 0) * 5, 20); // Activity bonus

                return {
                    user: { id: c.id, username: c.username, avatarUrl: c.avatarUrl, bio: c.bio },
                    profile: c.profile,
                    sharedGoals: sharedGoals.map(g => ({ category: g.category, title: g.title })),
                    matchScore: Math.max(0, Math.min(100, score)),
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore);
    }

    private levelDistance(a: string, b: string): number {
        const levels = ['beginner', 'intermediate', 'advanced'];
        return Math.abs(levels.indexOf(a) - levels.indexOf(b));
    }

    async sendInvite(senderId: string, receiverId: string, data: { goalId?: string; roomId?: string; competitionType?: string; interestCategory?: string; message?: string }) {
        const inviteCode = uuidv4().replace(/-/g, '').substring(0, 10);
        return this.prisma.matchInvite.create({
            data: {
                senderId,
                receiverId,
                goalId: data.goalId,
                roomId: data.roomId,
                competitionType: data.competitionType,
                interestCategory: data.interestCategory,
                message: data.message,
                inviteCode
            },
            include: {
                sender: { select: { id: true, username: true, avatarUrl: true } },
                receiver: { select: { id: true, username: true, avatarUrl: true } },
            },
        });
    }

    async getInvites(userId: string) {
        return this.prisma.matchInvite.findMany({
            where: { receiverId: userId, status: 'pending' },
            include: {
                sender: { select: { id: true, username: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async respondInvite(inviteId: string, userId: string, accept: boolean) {
        const invite = await this.prisma.matchInvite.findUnique({ where: { id: inviteId } });
        if (!invite || invite.receiverId !== userId) return null;

        const updatedInvite = await this.prisma.matchInvite.update({
            where: { id: inviteId },
            data: { status: accept ? 'accepted' : 'declined' },
        });

        const targetRoomId = invite.roomId || invite.goalId;
        if (accept && targetRoomId) {
            // Auto-join the room
            await this.roomsService.joinRoom(userId, targetRoomId);
        }

        return updatedInvite;
    }
}
