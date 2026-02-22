import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ObserverService } from './observer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('observer')
export class ObserverController {
    constructor(private readonly observerService: ObserverService) { }

    @Post('rooms/:roomId/watch')
    async watch(@Request() req: any, @Param('roomId') roomId: string) {
        return this.observerService.watchRoom(req.user.sub, roomId);
    }

    @Delete('rooms/:roomId/watch')
    async unwatch(@Request() req: any, @Param('roomId') roomId: string) {
        return this.observerService.unwatchRoom(req.user.sub, roomId);
    }

    @Post('rooms/:roomId/tip')
    async tip(@Request() req: any, @Param('roomId') roomId: string, @Body() body: { amount: number }) {
        return this.observerService.tipRoom(req.user.sub, roomId, body.amount);
    }

    @Get('rooms/:roomId')
    async getObservers(@Param('roomId') roomId: string) {
        return this.observerService.getRoomObservers(roomId);
    }

    @Get('watching')
    async getWatching(@Request() req: any) {
        return this.observerService.getWatchedRooms(req.user.sub);
    }
}
