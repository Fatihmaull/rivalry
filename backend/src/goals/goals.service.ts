import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, dto: CreateGoalDto) {
        return this.prisma.goal.create({
            data: { userId, ...dto },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.goal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const goal = await this.prisma.goal.findUnique({ where: { id } });
        if (!goal) throw new NotFoundException('Goal not found');
        return goal;
    }

    async update(id: string, userId: string, data: Partial<CreateGoalDto>) {
        return this.prisma.goal.update({
            where: { id },
            data,
        });
    }

    async delete(id: string, userId: string) {
        await this.prisma.goal.deleteMany({ where: { id, userId } });
        return { success: true };
    }

    async getCategories() {
        return [
            { id: 'fitness', label: 'Fitness', icon: '💪', color: '#FF6B6B' },
            { id: 'learning', label: 'Learning', icon: '📚', color: '#4ECDC4' },
            { id: 'career', label: 'Career', icon: '💼', color: '#45B7D1' },
            { id: 'business', label: 'Business', icon: '🚀', color: '#96CEB4' },
            { id: 'finance', label: 'Finance', icon: '💰', color: '#FFEAA7' },
            { id: 'content_creation', label: 'Content Creation', icon: '🎨', color: '#DDA0DD' },
        ];
    }
}
