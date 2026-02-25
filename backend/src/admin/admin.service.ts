import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    // ─── Dashboard Overview ───────────────────────────────────
    async getDashboardStats() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [
            totalUsers, activeToday, totalRooms, activeRooms,
            completedRooms, disputedRooms, totalInterests,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { updatedAt: { gte: todayStart } } }),
            this.prisma.room.count(),
            this.prisma.room.count({ where: { status: 'active' } }),
            this.prisma.room.count({ where: { status: 'completed' } }),
            this.prisma.room.count({ where: { status: 'disputed' } }),
            this.prisma.interest.count(),
        ]);

        const depositAgg = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { type: 'deposit', status: 'completed' },
        });
        const prizeAgg = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { type: 'prize', status: 'completed' },
        });
        const feeAgg = await this.prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { type: 'platform_fee' },
        });

        return {
            totalUsers,
            activeToday,
            totalRooms,
            activeRooms,
            completedRooms,
            disputedRooms,
            totalInterests,
            totalDeposits: Math.abs(Number(depositAgg._sum.amount || 0)),
            totalPrizePool: Number(prizeAgg._sum.amount || 0),
            platformRevenue: Math.abs(Number(feeAgg._sum.amount || 0)),
            flaggedContent: disputedRooms,
        };
    }

    async getRecentActivity(limit = 20) {
        const [users, rooms, transactions] = await Promise.all([
            this.prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, username: true, createdAt: true } }),
            this.prisma.room.findMany({ orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, title: true, status: true, prizePool: true, createdAt: true } }),
            this.prisma.transaction.findMany({
                orderBy: { createdAt: 'desc' }, take: limit,
                where: { amount: { gte: 50 } },
                include: { wallet: { include: { user: { select: { username: true } } } } },
            }),
        ]);
        return { recentUsers: users, recentRooms: rooms, largeTransactions: transactions };
    }

    async getGrowthData() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const users = await this.prisma.user.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        const rooms = await this.prisma.room.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        return { userGrowth: users, roomGrowth: rooms };
    }

    // ─── User Management ─────────────────────────────────────
    async getUsers(params: { page?: any; limit?: any; search?: string; status?: string; role?: string; sort?: string }) {
        const page = params.page ? Number(params.page) : 1;
        const limit = params.limit ? Number(params.limit) : 20;
        const { search, status, role, sort = 'createdAt_desc' } = params;
        const where: any = {};
        if (search) where.OR = [
            { username: { contains: search } },
            { email: { contains: search } },
        ];
        if (status) where.status = status;
        if (role) where.role = role;

        const [sortField, sortDir] = sort.split('_');
        const orderBy: any = { [sortField]: sortDir || 'desc' };

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy,
                include: {
                    profile: true,
                    wallet: { select: { balance: true, isFrozen: true } },
                    _count: { select: { participants: true, roomsCreated: true } },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return { users: users.map(u => ({ ...u, passwordHash: undefined })), total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async suspendUser(adminId: string, userId: string) {
        const user = await this.prisma.user.update({ where: { id: userId }, data: { status: 'suspended' } });
        await this.logAction(adminId, 'user_suspended', 'user', userId);
        return user;
    }

    async banUser(adminId: string, userId: string) {
        const user = await this.prisma.user.update({ where: { id: userId }, data: { status: 'banned' } });
        await this.logAction(adminId, 'user_banned', 'user', userId);
        return user;
    }

    async activateUser(adminId: string, userId: string) {
        const user = await this.prisma.user.update({ where: { id: userId }, data: { status: 'active' } });
        await this.logAction(adminId, 'user_activated', 'user', userId);
        return user;
    }

    async changeUserRole(adminId: string, userId: string, role: string) {
        const user = await this.prisma.user.update({ where: { id: userId }, data: { role } });
        await this.logAction(adminId, 'role_changed', 'user', userId, JSON.stringify({ newRole: role }));
        return user;
    }

    async verifyUser(adminId: string, userId: string) {
        const user = await this.prisma.user.update({ where: { id: userId }, data: { isVerified: true } });
        await this.logAction(adminId, 'user_verified', 'user', userId);
        return user;
    }

    async resetUserWallet(adminId: string, userId: string) {
        await this.prisma.wallet.update({ where: { userId }, data: { balance: 0 } });
        await this.logAction(adminId, 'wallet_reset', 'wallet', userId);
        return { success: true };
    }

    async deleteUser(adminId: string, userId: string) {
        await this.prisma.user.delete({ where: { id: userId } });
        await this.logAction(adminId, 'user_deleted', 'user', userId);
        return { success: true };
    }

    async removeUserFromRoom(adminId: string, userId: string, roomId: string) {
        await this.prisma.participant.delete({ where: { roomId_userId: { roomId, userId } } });
        await this.logAction(adminId, 'user_removed_from_room', 'room', roomId, JSON.stringify({ userId }));
        return { success: true };
    }

    // ─── Room Management ──────────────────────────────────────
    async getRooms(params: { page?: any; limit?: any; search?: string; status?: string; type?: string; sort?: string }) {
        const page = params.page ? Number(params.page) : 1;
        const limit = params.limit ? Number(params.limit) : 20;
        const { search, status, type, sort = 'createdAt_desc' } = params;
        const where: any = {};
        if (search) where.title = { contains: search };
        if (status) where.status = status;
        if (type) where.type = type;

        const [sortField, sortDir] = sort.split('_');
        const orderBy: any = { [sortField]: sortDir || 'desc' };

        const [rooms, total] = await Promise.all([
            this.prisma.room.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy,
                include: {
                    creator: { select: { id: true, username: true } },
                    goal: { select: { category: true } },
                    _count: { select: { participants: true, observers: true } },
                },
            }),
            this.prisma.room.count({ where }),
        ]);

        return { rooms, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async cancelRoom(adminId: string, roomId: string) {
        const room = await this.prisma.room.update({ where: { id: roomId }, data: { status: 'cancelled' } });
        await this.logAction(adminId, 'room_cancelled', 'room', roomId);
        return room;
    }

    async forceEndRoom(adminId: string, roomId: string) {
        const room = await this.prisma.room.update({ where: { id: roomId }, data: { status: 'completed', endDate: new Date() } });
        await this.logAction(adminId, 'room_force_ended', 'room', roomId);
        return room;
    }

    async refundRoom(adminId: string, roomId: string) {
        const participants = await this.prisma.participant.findMany({
            where: { roomId }, include: { user: { include: { wallet: true } } },
        });
        const room = await this.prisma.room.findUnique({ where: { id: roomId } });
        if (!room) return { success: false };
        const refundAmount = room.entryDeposit;

        for (const p of participants) {
            if (p.user.wallet) {
                await this.prisma.wallet.update({ where: { id: p.user.wallet.id }, data: { balance: { increment: refundAmount } } });
                await this.prisma.transaction.create({
                    data: { walletId: p.user.wallet.id, type: 'refund', amount: refundAmount, description: `Admin refund for room ${roomId}`, roomId },
                });
            }
        }
        await this.prisma.room.update({ where: { id: roomId }, data: { status: 'cancelled', prizePool: 0 } });
        await this.logAction(adminId, 'room_refunded', 'room', roomId);
        return { success: true, refundedCount: participants.length };
    }

    // ─── Transactions ─────────────────────────────────────────
    async getTransactions(params: { page?: any; limit?: any; type?: string; status?: string; sort?: string }) {
        const page = params.page ? Number(params.page) : 1;
        const limit = params.limit ? Number(params.limit) : 20;
        const { type, status, sort = 'createdAt_desc' } = params;
        const where: any = {};
        if (type) where.type = type;
        if (status) where.status = status;

        const [sortField, sortDir] = sort.split('_');
        const orderBy: any = { [sortField]: sortDir || 'desc' };

        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy,
                include: { wallet: { include: { user: { select: { id: true, username: true } } } } },
            }),
            this.prisma.transaction.count({ where }),
        ]);

        return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async freezeWallet(adminId: string, userId: string) {
        await this.prisma.wallet.update({ where: { userId }, data: { isFrozen: true } });
        await this.logAction(adminId, 'wallet_frozen', 'wallet', userId);
        return { success: true };
    }

    async unfreezeWallet(adminId: string, userId: string) {
        await this.prisma.wallet.update({ where: { userId }, data: { isFrozen: false } });
        await this.logAction(adminId, 'wallet_unfrozen', 'wallet', userId);
        return { success: true };
    }

    async reverseTransaction(adminId: string, transactionId: string) {
        const tx = await this.prisma.transaction.findUnique({ where: { id: transactionId }, include: { wallet: true } });
        if (!tx) return { success: false };
        await this.prisma.wallet.update({ where: { id: tx.walletId }, data: { balance: { decrement: tx.amount } } });
        await this.prisma.transaction.update({ where: { id: transactionId }, data: { status: 'reversed' } });
        await this.logAction(adminId, 'transaction_reversed', 'transaction', transactionId);
        return { success: true };
    }

    async flagTransaction(adminId: string, transactionId: string) {
        await this.prisma.transaction.update({ where: { id: transactionId }, data: { status: 'flagged' } });
        await this.logAction(adminId, 'transaction_flagged', 'transaction', transactionId);
        return { success: true };
    }

    // ─── Interests ────────────────────────────────────────────
    async getInterests() {
        return this.prisma.interest.findMany({ orderBy: { popularityScore: 'desc' } });
    }

    async createInterest(adminId: string, data: { name: string; description?: string; icon?: string; color?: string }) {
        const interest = await this.prisma.interest.create({ data });
        await this.logAction(adminId, 'interest_created', 'interest', interest.id);
        return interest;
    }

    async updateInterest(adminId: string, id: string, data: any) {
        const interest = await this.prisma.interest.update({ where: { id }, data });
        await this.logAction(adminId, 'interest_updated', 'interest', id);
        return interest;
    }

    async deleteInterest(adminId: string, id: string) {
        await this.prisma.interest.delete({ where: { id } });
        await this.logAction(adminId, 'interest_deleted', 'interest', id);
        return { success: true };
    }

    // ─── Analytics ────────────────────────────────────────────
    async getAnalytics() {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers, activeUsers7d, totalGoals, completedGoals, activeGoals,
            totalRooms, activeRooms, completedRooms, disputedRooms,
            totalParticipants, totalPrizeAgg,
            goalCats, skillLevels, roomTypes, roomStatuses
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { updatedAt: { gte: sevenDaysAgo } } }),
            this.prisma.goal.count(),
            this.prisma.goal.count({ where: { isActive: false } }), // Assuming inactive means completed if not deleted
            this.prisma.goal.count({ where: { isActive: true } }),
            this.prisma.room.count(),
            this.prisma.room.count({ where: { status: 'active' } }),
            this.prisma.room.count({ where: { status: 'completed' } }),
            this.prisma.room.count({ where: { status: 'disputed' } }),
            this.prisma.participant.count(),
            this.prisma.room.aggregate({ _sum: { prizePool: true }, _avg: { entryDeposit: true } }),
            this.prisma.goal.groupBy({ by: ['category'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
            this.prisma.profile.groupBy({ by: ['skillLevel'], _count: { id: true } }),
            this.prisma.room.groupBy({ by: ['type'], _count: { id: true } }),
            this.prisma.room.groupBy({ by: ['status'], _count: { id: true } }),
        ]);

        const topWinners = await this.prisma.profile.findMany({
            orderBy: { totalWins: 'desc' },
            take: 10,
            include: { user: { select: { id: true, username: true } } }
        });

        return {
            goalCompletionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
            avgRoomSize: totalRooms > 0 ? +(totalParticipants / totalRooms).toFixed(1) : 0,
            userRetention: totalUsers > 0 ? Math.round((activeUsers7d / totalUsers) * 100) : 0,
            activeGoalRate: totalGoals > 0 ? Math.round((activeGoals / totalGoals) * 100) : 0,
            topCategories: goalCats.map(c => ({ category: c.category, count: c._count.id })),
            topUsers: topWinners,
            totalRooms,
            activeRooms,
            completedRooms,
            disputedRooms,
            avgPrizePool: totalRooms > 0 ? Number(totalPrizeAgg._sum.prizePool || 0) / totalRooms : 0,
            avgDeposit: Number(totalPrizeAgg._avg.entryDeposit || 0),
            roomTypes: roomTypes.map(t => ({ type: t.type, count: t._count.id })),
            roomStatuses: roomStatuses.map(s => ({ status: s.status, count: s._count.id })),
            skillLevels: skillLevels.map(s => ({ level: s.skillLevel, count: s._count.id })),
        };
    }

    // ─── System Settings ──────────────────────────────────────
    async getSystemSettings() {
        return this.prisma.systemSettings.findMany({ orderBy: { key: 'asc' } });
    }

    async updateSystemSetting(adminId: string, key: string, value: string) {
        const setting = await this.prisma.systemSettings.upsert({
            where: { key }, create: { key, value, updatedBy: adminId }, update: { value, updatedBy: adminId },
        });
        await this.logAction(adminId, 'system_setting_changed', 'system', key, JSON.stringify({ value }));
        return setting;
    }

    // ─── Audit Log ────────────────────────────────────────────
    async getAuditLogs(params: { page?: any; limit?: any }) {
        const page = params.page ? Number(params.page) : 1;
        const limit = params.limit ? Number(params.limit) : 50;
        const [logs, total] = await Promise.all([
            this.prisma.adminAuditLog.findMany({
                skip: (page - 1) * limit, take: limit,
                orderBy: { createdAt: 'desc' },
                include: { admin: { select: { id: true, username: true } } },
            }),
            this.prisma.adminAuditLog.count(),
        ]);
        return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    private async logAction(adminId: string, action: string, targetType: string, targetId?: string, details?: string) {
        await this.prisma.adminAuditLog.create({ data: { adminId, action, targetType, targetId, details } });
    }
}
