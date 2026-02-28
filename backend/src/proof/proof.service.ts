import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsService } from '../rooms/rooms.service';
import { RivalryGateway } from '../gateway/rivalry.gateway';

@Injectable()
export class ProofService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => RoomsService))
        private readonly roomsService: RoomsService,
        @Inject(forwardRef(() => RivalryGateway))
        private readonly gateway: RivalryGateway,
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
                status: 'pending', // Now requires peer review
            },
        });

        // Add feed item
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        await this.prisma.roomFeedItem.create({
            data: {
                roomId: milestone.roadmap.roomId,
                type: 'proof_submitted',
                content: `${user?.username} submitted proof for: ${milestone.title}\n\nContent: ${data.content}`,
                mediaUrl: data.fileUrl || null,
                userId,
            },
        });

        // Notify via WebSocket
        this.gateway.notifyRoomUpdate(milestone.roadmap.roomId, 'room:proofSubmitted', {
            roomId: milestone.roadmap.roomId,
            milestoneId,
            userId,
            username: user?.username,
            proofId: proof.id,
        });

        return proof;
    }

    async reviewProof(reviewerId: string, proofId: string, approved: boolean) {
        const proof = await this.prisma.proofSubmission.findUnique({
            where: { id: proofId },
            include: {
                milestone: { include: { roadmap: { include: { room: true } } } },
            },
        });
        if (!proof) throw new NotFoundException('Proof submission not found');
        if (proof.status !== 'pending') throw new BadRequestException('Proof has already been reviewed');
        if (proof.userId === reviewerId) throw new BadRequestException('You cannot review your own proof');

        const room = proof.milestone.roadmap.room;

        // Verify reviewer is a participant or observer in the room
        const isParticipant = await this.prisma.participant.findUnique({
            where: { roomId_userId: { roomId: room.id, userId: reviewerId } },
        });
        const isObserver = await this.prisma.observer.findUnique({
            where: { roomId_userId: { roomId: room.id, userId: reviewerId } },
        });
        if (!isParticipant && !isObserver) {
            throw new BadRequestException('You must be a participant or observer to review proof');
        }

        const newStatus = approved ? 'approved' : 'rejected';

        const updatedProof = await this.prisma.proofSubmission.update({
            where: { id: proofId },
            data: { status: newStatus },
        });

        // If approved, update progress
        if (approved) {
            await this.updateProgress(proof.userId, proof.milestone.roadmapId, room.id, room.type);
        }

        // Add feed item
        const reviewer = await this.prisma.user.findUnique({ where: { id: reviewerId } });
        await this.prisma.roomFeedItem.create({
            data: {
                roomId: room.id,
                type: 'proof_submitted',
                content: `${reviewer?.username} ${approved ? '✅ approved' : '❌ rejected'} proof for: ${proof.milestone.title}`,
                userId: reviewerId,
            },
        });

        // Notify via WebSocket
        this.gateway.notifyRoomUpdate(room.id, 'room:proofReviewed', {
            roomId: room.id,
            proofId,
            status: newStatus,
            reviewerId,
            reviewerUsername: reviewer?.username,
        });

        // Notify the submitter
        this.gateway.notifyUser(proof.userId, 'proof:reviewed', {
            proofId,
            milestoneTitle: proof.milestone.title,
            status: newStatus,
            reviewerUsername: reviewer?.username,
        });

        return updatedProof;
    }

    private async updateProgress(userId: string, roadmapId: string, roomId: string, roomType: string) {
        const totalMilestones = await this.prisma.milestone.count({
            where: { roadmapId },
        });
        const completedMilestones = await this.prisma.proofSubmission.findMany({
            where: { userId, milestone: { roadmapId }, status: 'approved' },
            select: { milestoneId: true },
            distinct: ['milestoneId'],
        });

        const progress = (completedMilestones.length / totalMilestones) * 100;
        await this.prisma.participant.updateMany({
            where: { userId, roomId },
            data: { progress },
        });

        // Auto-complete if 100% and it's a 1v1 room
        if (progress >= 100 && (roomType === '1v1' || roomType === 'group' || roomType === 'free_for_all')) {
            await this.roomsService.completeRoom(roomId);
        }
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

    async getPendingForRoom(roomId: string) {
        return this.prisma.proofSubmission.findMany({
            where: {
                status: 'pending',
                milestone: { roadmap: { roomId } },
            },
            include: {
                user: { select: { id: true, username: true, avatarUrl: true } },
                milestone: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
