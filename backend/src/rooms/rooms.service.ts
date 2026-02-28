import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RivalryGateway } from '../gateway/rivalry.gateway';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly walletService: WalletService,
        @Inject(forwardRef(() => RivalryGateway))
        private readonly gateway: RivalryGateway,
    ) { }

    async create(userId: string, dto: CreateRoomDto) {
        const maxPlayers = dto.type === '1v1' ? 2 : (dto.maxPlayers || 10);

        let room = await this.prisma.room.findFirst({
            where: { creatorId: userId, status: 'draft' },
        });

        if (room) {
            room = await this.prisma.room.update({
                where: { id: room.id },
                data: {
                    title: dto.title,
                    description: dto.description,
                    goalId: dto.goalId,
                    type: dto.type,
                    entryDeposit: dto.entryDeposit,
                    proofType: dto.proofType,
                    duration: dto.duration,
                    maxPlayers,
                }
            });
        } else {
            room = await this.prisma.room.create({
                data: {
                    creatorId: userId,
                    title: dto.title,
                    description: dto.description,
                    goalId: dto.goalId,
                    type: dto.type,
                    status: 'draft',
                    entryDeposit: dto.entryDeposit,
                    proofType: dto.proofType,
                    duration: dto.duration,
                    maxPlayers,
                },
                include: { creator: { select: { id: true, username: true, avatarUrl: true } } },
            });
        }

        // Creator auto-joins
        const isParticipant = await this.prisma.participant.findUnique({
            where: { roomId_userId: { roomId: room.id, userId } },
        });

        if (!isParticipant) {
            await this.joinRoom(userId, room.id);
        }

        // Once creator joins, it becomes waiting (if they are the only one)
        await this.prisma.room.update({
            where: { id: room.id },
            data: { status: 'waiting' }
        });

        return this.findById(room.id);
    }

    async findById(id: string) {
        const room = await this.prisma.room.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, username: true, avatarUrl: true } },
                goal: true,
                participants: {
                    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
                    orderBy: { progress: 'desc' },
                },
                roadmap: {
                    include: {
                        milestones: {
                            orderBy: { orderIndex: 'asc' },
                            include: { substeps: true, proofs: true }
                        }
                    }
                },
                feedItems: { orderBy: { createdAt: 'desc' }, take: 20 },
                _count: { select: { observers: true } },
            },
        });
        if (!room) throw new NotFoundException('Room not found');
        return room;
    }

    async joinRoom(userId: string, roomId: string) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { _count: { select: { participants: true } } },
        });
        if (!room) throw new NotFoundException('Room not found');
        if (room.status !== 'waiting' && room.status !== 'draft') {
            throw new BadRequestException('Room is not accepting players');
        }
        if (room._count.participants >= room.maxPlayers) {
            throw new BadRequestException('Room is full');
        }

        // Check if already joined
        const existing = await this.prisma.participant.findUnique({
            where: { roomId_userId: { roomId, userId } },
        });
        if (existing) throw new BadRequestException('Already in this room');

        // Deposit if required
        if (Number(room.entryDeposit) > 0) {
            await this.walletService.deposit(userId, Number(room.entryDeposit), roomId);
            await this.prisma.room.update({
                where: { id: roomId },
                data: { prizePool: { increment: Number(room.entryDeposit) } },
            });
        }

        await this.prisma.participant.create({
            data: { roomId, userId },
        });

        // Add feed item
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        await this.prisma.roomFeedItem.create({
            data: {
                roomId,
                type: 'player_joined',
                content: `${user?.username} joined the competition`,
                userId,
            },
        });

        // Auto-generate roadmap if the room is fully booked
        const count = await this.prisma.participant.count({ where: { roomId } });
        if (count >= room.maxPlayers) {
            // Generate roadmap
            await this.generateRoadmap(roomId, room.title, room.duration);

            const agreementDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            await this.prisma.room.update({
                where: { id: roomId },
                data: { status: 'waiting_for_agreement', agreementDeadline }
            });
            this.gateway.notifyRoomUpdate(roomId, 'room:waitingForAgreement', { roomId, agreementDeadline });
        }

        // Notify via WebSocket
        this.gateway.notifyRoomUpdate(roomId, 'room:playerJoined', {
            roomId,
            userId,
            username: user?.username,
        });

        return this.findById(roomId);
    }

    async activateRoom(roomId: string) {
        const now = new Date();
        const room = await this.prisma.room.findUnique({ where: { id: roomId } });
        if (!room) throw new NotFoundException('Room not found');

        const durationMap: Record<string, number> = {
            '1_week': 7, '2_weeks': 14, '1_month': 30, '3_months': 90,
        };
        const days = durationMap[room.duration] || 30;
        const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        await this.prisma.room.update({
            where: { id: roomId },
            data: { status: 'active', startDate: now, endDate },
        });

        // Notify via WebSocket
        this.gateway.notifyRoomUpdate(roomId, 'room:activated', {
            roomId,
            startDate: now,
            endDate,
        });
    }

    async agreeToRoadmap(userId: string, roomId: string) {
        const participant = await this.prisma.participant.findUnique({
            where: { roomId_userId: { roomId, userId } }
        });
        if (!participant) throw new NotFoundException('Participant not found');
        if (participant.hasAgreed) return this.findById(roomId);

        await this.prisma.participant.update({
            where: { id: participant.id },
            data: { hasAgreed: true }
        });

        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { participants: true }
        });

        if (!room) throw new NotFoundException('Room not found');

        const allAgreed = room.participants.every(p => p.hasAgreed);
        if (allAgreed && room.participants.length >= room.maxPlayers) {
            const startDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
            await this.prisma.room.update({
                where: { id: roomId },
                data: { status: 'waiting_for_start', startDeadline }
            });
            this.gateway.notifyRoomUpdate(roomId, 'room:waitingForStart', { roomId, startDeadline });
        }
        return this.findById(roomId);
    }

    async startRoomIfReady(userId: string, roomId: string) {
        const participant = await this.prisma.participant.findUnique({
            where: { roomId_userId: { roomId, userId } }
        });
        if (!participant) throw new NotFoundException('Participant not found');
        if (participant.hasStarted) return this.findById(roomId);

        await this.prisma.participant.update({
            where: { id: participant.id },
            data: { hasStarted: true }
        });

        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { participants: true }
        });

        if (!room) throw new NotFoundException('Room not found');

        const allStarted = room.participants.every(p => p.hasStarted);
        if (allStarted && room.participants.length >= room.maxPlayers) {
            await this.activateRoom(roomId);
        } else {
            const notStarted = room.participants.filter(p => !p.hasStarted);
            notStarted.forEach(p => {
                this.gateway.notifyUser(p.userId, 'room:startReminder', { roomId });
            });
        }
        return this.findById(roomId);
    }

    private async generateRoadmap(roomId: string, goalTitle: string, duration: string) {
        const weekMap: Record<string, number> = {
            '1_week': 1, '2_weeks': 2, '1_month': 4, '3_months': 12,
        };
        const weeks = weekMap[duration] || 4;

        // Ensure we don't duplicate roadmap if called multiple times (e.g. race conditions)
        let roadmap = await this.prisma.roadmap.findUnique({ where: { roomId } });
        if (roadmap) return;

        roadmap = await this.prisma.roadmap.create({
            data: {
                roomId,
                title: `${goalTitle} Roadmap`,
            },
        });

        const milestoneTemplates = this.getMilestoneTemplates(weeks);
        for (let i = 0; i < milestoneTemplates.length; i++) {
            const milestone = await this.prisma.milestone.create({
                data: {
                    roadmapId: roadmap.id,
                    title: milestoneTemplates[i].title,
                    description: milestoneTemplates[i].description,
                    weekNumber: milestoneTemplates[i].week,
                    orderIndex: i,
                },
            });

            for (const substepTitle of milestoneTemplates[i].substeps) {
                await this.prisma.substep.create({
                    data: {
                        milestoneId: milestone.id,
                        title: substepTitle,
                    }
                });
            }
        }
    }

    private getMilestoneTemplates(weeks: number) {
        const templates = [];
        for (let w = 1; w <= weeks; w++) {
            if (w === 1) {
                templates.push({
                    week: w,
                    title: 'Foundation & Setup',
                    description: 'Set up your environment and define your core routine.',
                    substeps: [
                        'Define 3 measurable daily habits related to your goal',
                        'Set up your tracking environment (apps, journals, workspace)',
                        'Complete a 15-minute introductory study or warm-up'
                    ]
                });
                templates.push({
                    week: w,
                    title: 'Initial Benchmark',
                    description: 'Assess your current level and perform your first full session.',
                    substeps: [
                        'Perform a baseline test (e.g., current max weight, typing speed, vocab count)',
                        'Record a "Day 1" video or photo of your current progress',
                        'Submit proof of your first 30-minute deep-work session'
                    ]
                });
            } else if (w === weeks) {
                templates.push({
                    week: w,
                    title: 'Mastery Challenge',
                    description: 'Push your limits and aim for your peak performance.',
                    substeps: [
                        'Complete a high-intensity session at 110% of your benchmark',
                        'Document your most difficult hurdle and how you overcame it',
                        'Prepare your final summary of weekly achievements'
                    ]
                });
                templates.push({
                    week: w,
                    title: 'Final Submission',
                    description: 'Compare your results with Week 1 and present your achievement.',
                    substeps: [
                        'Re-run your baseline test and record the improvement',
                        'Assemble a montage or summary of your journey',
                        'Submit your final proof for community validation'
                    ]
                });
            } else {
                templates.push({
                    week: w,
                    title: `Week ${w} Technique Refinement`,
                    description: `Focus on specific skills and improve consistency.`,
                    substeps: [
                        'Watch/read one advanced tutorial and implement one technique',
                        'Achieve a 5-day streak of your core habits',
                        'Identify and fix one common mistake in your routine'
                    ]
                });
                templates.push({
                    week: w,
                    title: `Week ${w} Volume Increase`,
                    description: `Scale up your effort and build endurance.`,
                    substeps: [
                        'Increase your session duration or intensity by 15%',
                        'Collaborate or share progress with a peer for feedback',
                        'Complete a "marathon" session (double your usual time)'
                    ]
                });
            }
        }
        return templates;
    }

    async completeRoom(roomId: string) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { participants: { orderBy: { progress: 'desc' } } },
        });
        if (!room) throw new NotFoundException('Room not found');
        if (room.status === 'completed') return room;
        if (room.status !== 'active' && room.status !== 'disputed') {
            throw new BadRequestException('Room cannot be completed in its current status');
        }

        const winner = room.participants[0];
        if (winner) {
            await this.prisma.room.update({
                where: { id: roomId },
                data: { status: 'completed', winnerId: winner.userId },
            });

            // Distribute prize
            if (Number(room.prizePool) > 0) {
                await this.walletService.distributePrize(winner.userId, Number(room.prizePool), roomId);
            }

            // Add feed item
            const user = await this.prisma.user.findUnique({ where: { id: winner.userId } });
            await this.prisma.roomFeedItem.create({
                data: {
                    roomId,
                    type: 'milestone_completed',
                    content: `${user?.username} won the competition and claimed the prize pool of ${room.prizePool} credits!`,
                    userId: winner.userId,
                },
            });

            // Update stats
            await this.prisma.profile.update({
                where: { userId: winner.userId },
                data: {
                    totalWins: { increment: 1 },
                    totalCompleted: { increment: 1 },
                    totalPrizeWon: { increment: room.prizePool },
                },
            });

            // Mark losers
            for (const p of room.participants) {
                if (p.userId !== winner.userId) {
                    await this.prisma.profile.update({
                        where: { userId: p.userId },
                        data: { totalLosses: { increment: 1 }, totalCompleted: { increment: 1 } },
                    });
                }
                await this.prisma.participant.update({
                    where: { id: p.id },
                    data: { status: 'completed', rank: room.participants.indexOf(p) + 1 },
                });
            }
        }

        // Notify via WebSocket
        this.gateway.notifyRoomUpdate(roomId, 'room:completed', {
            roomId,
            winnerId: winner?.userId,
        });

        return this.findById(roomId);
    }

    async pokePlayers(userId: string, roomId: string) {
        const room = await this.prisma.room.findUnique({ where: { id: roomId } });
        if (!room) throw new NotFoundException('Room not found');

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        let message = `${user.username} sent a notification.`;
        if (room.status === 'waiting_for_agreement') {
            message = `@${user.username} is waiting for everyone to agree to the roadmap.`;
        } else if (room.status === 'waiting_for_start') {
            message = `@${user.username} is waiting for everyone to start the competition.`;
        } else {
            message = `@${user.username} poked the room.`;
        }

        // Drop the message directly into the room's feed.
        await this.prisma.roomFeedItem.create({
            data: {
                roomId,
                type: 'message',
                content: message,
                userId,
            }
        });

        // Broadcast to clients listening to this room via WebSocket to ensure immediate polling
        this.gateway.notifyRoomUpdate(roomId, 'room:update', { roomId });

        return { success: true, message: 'Notification sent' };
    }

    async reportWinner(userId: string, roomId: string) {
        const room = await this.prisma.room.findUnique({ where: { id: roomId } });
        if (!room) throw new NotFoundException('Room not found');

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        console.log(`[🚩 REPORT FLAG] User @${user?.username} reported the winner of Room ${roomId} for suspicious activity.`);

        // Add a visible feed item about the flag
        await this.prisma.roomFeedItem.create({
            data: {
                roomId,
                type: 'message',
                content: `🚨 @${user?.username} flagged the winning result for admin review.`,
                userId,
            }
        });

        // Broadcast a room update for the feed
        this.gateway.notifyRoomUpdate(roomId, 'room:update', { roomId });

        return { success: true, message: 'Report submitted for admin review.' };
    }

    async listRooms(filters: { status?: string; type?: string; category?: string }, page = 1) {
        const where: any = {};
        if (filters.status) where.status = filters.status;
        if (filters.type) where.type = filters.type;

        const rooms = await this.prisma.room.findMany({
            where,
            include: {
                creator: { select: { id: true, username: true, avatarUrl: true } },
                _count: { select: { participants: true, observers: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            skip: (page - 1) * 20,
        });

        const total = await this.prisma.room.count({ where });
        return { rooms, total, page };
    }

    async getUserRooms(userId: string) {
        const participations = await this.prisma.participant.findMany({
            where: { userId },
            include: {
                room: {
                    include: {
                        creator: { select: { id: true, username: true, avatarUrl: true } },
                        _count: { select: { participants: true } },
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        });
        return participations.map(p => ({ ...p.room, myStatus: p.status, myProgress: p.progress }));
    }
}
