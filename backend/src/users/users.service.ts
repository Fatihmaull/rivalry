import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
                wallet: true,
                goals: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        participants: true,
                    },
                },
            },
        });
        if (!user) throw new NotFoundException('User not found');
        const { passwordHash, ...safe } = user;
        return safe;
    }

    async findByUsername(username: string) {
        const user = await this.prisma.user.findUnique({
            where: { username },
            include: {
                profile: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        participants: true,
                    },
                },
            },
        });
        if (!user) throw new NotFoundException('User not found');
        const { passwordHash, ...safe } = user;
        return safe;
    }

    async updateProfile(userId: string, data: { bio?: string; interests?: string[]; skillLevel?: string }) {
        const updateData: any = {};
        if (data.bio !== undefined) {
            await this.prisma.user.update({ where: { id: userId }, data: { bio: data.bio } });
        }
        if (data.interests) updateData.interests = JSON.stringify(data.interests);
        if (data.skillLevel) updateData.skillLevel = data.skillLevel;

        if (Object.keys(updateData).length > 0) {
            await this.prisma.profile.update({
                where: { userId },
                data: updateData,
            });
        }

        return this.findById(userId);
    }

    async follow(followerId: string, followingId: string) {
        await this.prisma.follow.create({
            data: { followerId, followingId },
        });
        return { success: true };
    }

    async unfollow(followerId: string, followingId: string) {
        await this.prisma.follow.deleteMany({
            where: { followerId, followingId },
        });
        return { success: true };
    }

    async getFollowers(userId: string) {
        const followers = await this.prisma.follow.findMany({
            where: { followingId: userId },
            include: { follower: { select: { id: true, username: true, avatarUrl: true } } },
        });
        return followers.map(f => f.follower);
    }

    async getFollowing(userId: string) {
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            include: { following: { select: { id: true, username: true, avatarUrl: true } } },
        });
        return following.map(f => f.following);
    }

    async getStats(userId: string) {
        const profile = await this.prisma.profile.findUnique({ where: { userId } });
        const activeRooms = await this.prisma.participant.count({
            where: { userId, status: 'active' },
        });
        return {
            ...profile,
            activeRooms,
            winRate: profile && (profile.totalWins + profile.totalLosses) > 0
                ? (profile.totalWins / (profile.totalWins + profile.totalLosses) * 100).toFixed(1)
                : '0',
        };
    }

    async searchUsers(query: string, limit = 20) {
        return this.prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: query } },
                    { email: { contains: query } },
                ],
            },
            select: { id: true, username: true, avatarUrl: true, bio: true },
            take: limit,
        });
    }
}
