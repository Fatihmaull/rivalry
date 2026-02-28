import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RivalryGateway } from '../gateway/rivalry.gateway';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly walletService: WalletService,
        private readonly gateway: RivalryGateway,
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleExpiredRooms() {
        this.logger.log('Checking for expired rooms...');

        const expiredRooms = await this.prisma.room.findMany({
            where: {
                status: 'active',
                endDate: { lte: new Date() },
            },
            include: {
                participants: {
                    orderBy: { progress: 'desc' },
                },
            },
        });

        if (expiredRooms.length === 0) {
            this.logger.log('No expired rooms found.');
            return;
        }

        this.logger.log(`Found ${expiredRooms.length} expired room(s). Auto-completing...`);

        for (const room of expiredRooms) {
            try {
                const winner = room.participants[0];

                if (winner) {
                    // Mark room as completed
                    await this.prisma.room.update({
                        where: { id: room.id },
                        data: { status: 'completed', winnerId: winner.userId },
                    });

                    // Distribute prize pool to winner
                    if (Number(room.prizePool) > 0) {
                        await this.walletService.distributePrize(
                            winner.userId,
                            Number(room.prizePool),
                            room.id,
                        );
                    }

                    // Update participant stats
                    for (const p of room.participants) {
                        const isWinner = p.userId === winner.userId;
                        await this.prisma.profile.updateMany({
                            where: { userId: p.userId },
                            data: {
                                totalWins: isWinner ? { increment: 1 } : undefined,
                                totalLosses: !isWinner ? { increment: 1 } : undefined,
                                totalCompleted: { increment: 1 },
                                totalPrizeWon: isWinner ? { increment: Number(room.prizePool) } : undefined,
                            },
                        });

                        await this.prisma.participant.update({
                            where: { id: p.id },
                            data: {
                                status: 'completed',
                                rank: room.participants.indexOf(p) + 1,
                            },
                        });
                    }

                    // Add feed item
                    const user = await this.prisma.user.findUnique({ where: { id: winner.userId } });
                    await this.prisma.roomFeedItem.create({
                        data: {
                            roomId: room.id,
                            type: 'milestone_completed',
                            content: `⏰ Room deadline reached. 🏆 ${user?.username} wins with ${Number(winner.progress).toFixed(0)}% progress!`,
                            userId: winner.userId,
                        },
                    });

                    // Notify via WebSocket
                    this.gateway.notifyRoomUpdate(room.id, 'room:completed', {
                        roomId: room.id,
                        winnerId: winner.userId,
                        winnerUsername: user?.username,
                    });
                } else {
                    // No participants — just mark completed
                    await this.prisma.room.update({
                        where: { id: room.id },
                        data: { status: 'completed' },
                    });
                }

                this.logger.log(`Room ${room.id} (${room.title}) auto-completed.`);
            } catch (error) {
                this.logger.error(`Failed to auto-complete room ${room.id}:`, error);
            }
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handlePreActiveTimeouts() {
        this.logger.log('Checking for pre-active room timeouts...');
        const now = new Date();

        // 1. Check agreement timeouts
        const expiredAgreement = await this.prisma.room.findMany({
            where: {
                status: 'waiting_for_agreement',
                agreementDeadline: { lte: now },
            },
            include: { participants: true }
        });

        for (const room of expiredAgreement) {
            try {
                await this.prisma.room.update({
                    where: { id: room.id },
                    data: { status: 'expired' }
                });

                if (Number(room.entryDeposit) > 0) {
                    for (const p of room.participants) {
                        await this.walletService.refund(p.userId, Number(room.entryDeposit), room.id);
                    }
                }

                this.gateway.notifyRoomUpdate(room.id, 'room:expired', { roomId: room.id, reason: 'Agreement timeout' });
                this.logger.log(`Room ${room.id} expired (Agreement timeout).`);
            } catch (error) {
                this.logger.error(`Failed to expire agreement timeout room ${room.id}:`, error);
            }
        }

        // 2. Check start timeouts
        const expiredStart = await this.prisma.room.findMany({
            where: {
                status: 'waiting_for_start',
                startDeadline: { lte: now },
            },
            include: { participants: true }
        });

        for (const room of expiredStart) {
            try {
                await this.prisma.room.update({
                    where: { id: room.id },
                    data: { status: 'expired' }
                });

                if (Number(room.entryDeposit) > 0) {
                    for (const p of room.participants) {
                        await this.walletService.refund(p.userId, Number(room.entryDeposit), room.id);
                    }
                }

                this.gateway.notifyRoomUpdate(room.id, 'room:expired', { roomId: room.id, reason: 'Start timeout' });
                this.logger.log(`Room ${room.id} expired (Start timeout).`);
            } catch (error) {
                this.logger.error(`Failed to expire start timeout room ${room.id}:`, error);
            }
        }
    }
}
