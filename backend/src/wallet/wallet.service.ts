import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletService {
    constructor(private readonly prisma: PrismaService) { }

    async getWallet(userId: string) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            include: {
                transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
            },
        });
        if (!wallet) throw new NotFoundException('Wallet not found');
        return wallet;
    }

    async topUp(userId: string, amount: number) {
        if (amount <= 0) throw new BadRequestException('Amount must be positive');

        await this.prisma.$transaction(async (tx) => {
            await tx.wallet.update({
                where: { userId },
                data: { balance: { increment: amount } },
            });

            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new NotFoundException('Wallet not found');

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'top_up',
                    amount,
                    description: `Top up of ${amount} credits`,
                },
            });
        });

        return this.getWallet(userId);
    }

    async deposit(userId: string, amount: number, roomId: string) {
        await this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new NotFoundException('Wallet not found');
            if (Number(wallet.balance) < amount) throw new BadRequestException('Insufficient balance');

            await tx.wallet.update({
                where: { userId },
                data: { balance: { decrement: amount } },
            });

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'deposit',
                    amount: -amount,
                    description: `Room deposit`,
                    roomId,
                },
            });
        });

        return this.getWallet(userId);
    }

    async distributePrize(userId: string, amount: number, roomId: string) {
        await this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new NotFoundException('Wallet not found');

            await tx.wallet.update({
                where: { userId },
                data: { balance: { increment: amount } },
            });

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'prize',
                    amount,
                    description: `Prize won`,
                    roomId,
                },
            });
        });

        return this.getWallet(userId);
    }

    async refund(userId: string, amount: number, roomId: string) {
        if (amount <= 0) return this.getWallet(userId);

        await this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new NotFoundException('Wallet not found');

            await tx.wallet.update({
                where: { userId },
                data: { balance: { increment: amount } },
            });

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'refund',
                    amount,
                    description: `Room deposit refunded`,
                    roomId,
                },
            });

            // Deduct from room prize pool if applicable
            await tx.room.update({
                where: { id: roomId },
                data: { prizePool: { decrement: amount } },
            });
        });

        return this.getWallet(userId);
    }

    async withdraw(userId: string, amount: number) {
        await this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new NotFoundException('Wallet not found');
            if (Number(wallet.balance) < amount) throw new BadRequestException('Insufficient balance');

            await tx.wallet.update({
                where: { userId },
                data: { balance: { decrement: amount } },
            });

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'withdrawal',
                    amount: -amount,
                    description: `Withdrawal of ${amount} credits`,
                },
            });
        });

        return this.getWallet(userId);
    }

    async tip(userId: string, amount: number, roomId: string) {
        await this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new NotFoundException('Wallet not found');
            if (Number(wallet.balance) < amount) throw new BadRequestException('Insufficient balance');

            await tx.wallet.update({
                where: { userId },
                data: { balance: { decrement: amount } },
            });

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'tip',
                    amount: -amount,
                    description: `Tip to room prize pool`,
                    roomId,
                },
            });

            // Add to room prize pool
            await tx.room.update({
                where: { id: roomId },
                data: { prizePool: { increment: amount } },
            });
        });

        return this.getWallet(userId);
    }
}
