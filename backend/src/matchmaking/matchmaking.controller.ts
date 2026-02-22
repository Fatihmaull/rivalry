import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('matchmaking')
export class MatchmakingController {
    constructor(private readonly matchmakingService: MatchmakingService) { }

    @Get('rivals')
    async findRivals(@Request() req: any) {
        return this.matchmakingService.findRivals(req.user.sub);
    }

    @Post('invite')
    async sendInvite(@Request() req: any, @Body() body: { receiverId: string; goalId?: string; message?: string }) {
        return this.matchmakingService.sendInvite(req.user.sub, body.receiverId, body.goalId, body.message);
    }

    @Get('invites')
    async getInvites(@Request() req: any) {
        return this.matchmakingService.getInvites(req.user.sub);
    }

    @Post('invites/:id/respond')
    async respondInvite(@Request() req: any, @Param('id') id: string, @Body() body: { accept: boolean }) {
        return this.matchmakingService.respondInvite(id, req.user.sub, body.accept);
    }
}
