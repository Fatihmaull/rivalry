import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedService {
    constructor(private readonly prisma: PrismaService) { }

    async createPost(userId: string, data: { type: string; content: string; imageUrl?: string; roomId?: string }) {
        return this.prisma.post.create({
            data: { userId, ...data },
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
                _count: { select: { comments: true } },
            },
        });
    }

    async getFeed(userId: string, page = 1) {
        // Get posts from followed users + own posts
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const followingIds = following.map(f => f.followingId);
        followingIds.push(userId);

        const posts = await this.prisma.post.findMany({
            where: { userId: { in: followingIds } },
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
                comments: {
                    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'asc' },
                    take: 3,
                },
                _count: { select: { comments: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            skip: (page - 1) * 20,
        });

        return posts;
    }

    async getExploreFeed(page = 1) {
        return this.prisma.post.findMany({
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
                _count: { select: { comments: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            skip: (page - 1) * 20,
        });
    }

    async addComment(userId: string, postId: string, content: string) {
        return this.prisma.comment.create({
            data: { userId, postId, content },
            include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        });
    }

    async getComments(postId: string) {
        return this.prisma.comment.findMany({
            where: { postId },
            include: { user: { select: { id: true, username: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
}
