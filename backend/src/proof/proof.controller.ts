import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProofService } from './proof.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('proof')
export class ProofController {
    constructor(private readonly proofService: ProofService) { }

    @Post('milestone/:milestoneId')
    async submit(
        @Request() req: any,
        @Param('milestoneId') milestoneId: string,
        @Body() body: { type: string; content: string; fileUrl?: string },
    ) {
        return this.proofService.submit(req.user.sub, milestoneId, body);
    }

    @Get('milestone/:milestoneId')
    async getByMilestone(@Param('milestoneId') milestoneId: string) {
        return this.proofService.getByMilestone(milestoneId);
    }

    @Get('user')
    async getMyProofs(@Request() req: any) {
        return this.proofService.getByUser(req.user.sub);
    }
}
