import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchmakingService {
    constructor(private readonly prisma: PrismaService) { }

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

    async sendInvite(senderId: string, receiverId: string, goalId?: string, message?: string) {
        return this.prisma.matchInvite.create({
            data: { senderId, receiverId, goalId, message },
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

        return this.prisma.matchInvite.update({
            where: { id: inviteId },
            data: { status: accept ? 'accepted' : 'declined' },
        });
    }
}
