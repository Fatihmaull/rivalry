import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('goals')
export class GoalsController {
    constructor(private readonly goalsService: GoalsService) { }

    @Get('categories')
    async getCategories() {
        return this.goalsService.getCategories();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Request() req: any, @Body() dto: CreateGoalDto) {
        return this.goalsService.create(req.user.sub, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getMyGoals(@Request() req: any) {
        return this.goalsService.findByUser(req.user.sub);
    }

    @Get(':id')
    async getGoal(@Param('id') id: string) {
        return this.goalsService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Request() req: any, @Param('id') id: string, @Body() dto: Partial<CreateGoalDto>) {
        return this.goalsService.update(id, req.user.sub, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Request() req: any, @Param('id') id: string) {
        return this.goalsService.delete(id, req.user.sub);
    }
}
