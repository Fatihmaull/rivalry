import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class ObserverService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly walletService: WalletService,
    ) { }

    async watchRoom(userId: string, roomId: string) {
        const room = await this.prisma.room.findUnique({ where: { id: roomId } });
        if (!room) throw new NotFoundException('Room not found');

        await this.prisma.observer.upsert({
            where: { roomId_userId: { roomId, userId } },
            create: { roomId, userId },
            update: {},
        });

        return { success: true };
    }

    async unwatchRoom(userId: string, roomId: string) {
        await this.prisma.observer.deleteMany({ where: { roomId, userId } });
        return { success: true };
    }

    async tipRoom(userId: string, roomId: string, amount: number) {
        return this.walletService.tip(userId, amount, roomId);
    }

    async getRoomObservers(roomId: string) {
        return this.prisma.observer.findMany({
            where: { roomId },
            include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        });
    }

    async getWatchedRooms(userId: string) {
        const watches = await this.prisma.observer.findMany({
            where: { userId },
            include: {
                room: {
                    include: {
                        creator: { select: { id: true, username: true, avatarUrl: true } },
                        _count: { select: { participants: true, observers: true } },
                    },
                },
            },
        });
        return watches.map(w => w.room);
    }
}
