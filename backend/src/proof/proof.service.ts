import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class ProofService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => RoomsService))
        private readonly roomsService: RoomsService,
    ) { }

    async submit(userId: string, milestoneId: string, data: { type: string; content: string; fileUrl?: string }) {
        const milestone = await this.prisma.milestone.findUnique({
            where: { id: milestoneId },
            include: { roadmap: { include: { room: true } } },
        });
        if (!milestone) throw new NotFoundException('Milestone not found');

        const proof = await this.prisma.proofSubmission.create({
            data: {
                milestoneId,
                userId,
                type: data.type,
                content: data.content,
                fileUrl: data.fileUrl,
                status: 'approved', // Auto-approve for MVP
            },
        });

        // Update user progress in the room
        const totalMilestones = await this.prisma.milestone.count({
            where: { roadmapId: milestone.roadmapId },
        });
        const completedMilestones = await this.prisma.proofSubmission.findMany({
            where: { userId, milestone: { roadmapId: milestone.roadmapId }, status: 'approved' },
            select: { milestoneId: true },
            distinct: ['milestoneId'],
        });

        const progress = (completedMilestones.length / totalMilestones) * 100;
        await this.prisma.participant.updateMany({
            where: { userId, roomId: milestone.roadmap.roomId },
            data: { progress },
        });

        // Add feed item
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        await this.prisma.roomFeedItem.create({
            data: {
                roomId: milestone.roadmap.roomId,
                type: 'proof_submitted',
                content: `${user?.username} completed: ${milestone.title}`,
                userId,
            },
        });

        // Auto-complete if 100% and it's a 1v1 room
        if (progress >= 100 && milestone.roadmap.room.type === '1v1') {
            await this.roomsService.completeRoom(milestone.roadmap.roomId);
        }

        return proof;
    }

    async getByMilestone(milestoneId: string) {
        return this.prisma.proofSubmission.findMany({
            where: { milestoneId },
            include: { user: { select: { id: true, username: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getByUser(userId: string) {
        return this.prisma.proofSubmission.findMany({
            where: { userId },
            include: { milestone: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
