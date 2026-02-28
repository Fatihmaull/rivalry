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
                votes: { where: { userId } }, // Getting current user's vote
                _count: { select: { comments: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            skip: (page - 1) * 20,
        });

        return posts.map(post => {
            const userVote = post.votes[0]?.voteType || 0;
            const { votes, ...rest } = post;
            return { ...rest, userVote };
        });
    }

    async getExploreFeed(userId?: string, page = 1) {
        const posts = await this.prisma.post.findMany({
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
                votes: userId ? { where: { userId } } : undefined,
                _count: { select: { comments: true } },
            },
            orderBy: [
                { score: 'desc' },
                { createdAt: 'desc' }
            ],
            take: 20,
            skip: (page - 1) * 20,
        });

        return posts.map(post => {
            const userVote = post.votes ? (post.votes[0]?.voteType || 0) : 0;
            const { votes, ...rest } = post as any;
            return { ...rest, userVote };
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

    async votePost(userId: string, postId: string, voteType: number) {
        // voteType: 1 for upvote, -1 for downvote, 0 to remove vote
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new Error('Post not found');

        const existingVote = await this.prisma.postVote.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        let newScore = post.score;

        if (existingVote) {
            newScore -= existingVote.voteType; // Remove old vote from score
            if (voteType === 0) {
                // Remove vote entirely
                await this.prisma.postVote.delete({ where: { id: existingVote.id } });
            } else {
                // Update vote
                newScore += voteType;
                await this.prisma.postVote.update({
                    where: { id: existingVote.id },
                    data: { voteType },
                });
            }
        } else if (voteType !== 0) {
            // New vote
            newScore += voteType;
            await this.prisma.postVote.create({
                data: { userId, postId, voteType },
            });
        }

        // Update post score
        const updatedPost = await this.prisma.post.update({
            where: { id: postId },
            data: { score: newScore },
        });

        return { score: updatedPost.score, userVote: voteType };
    }
}
