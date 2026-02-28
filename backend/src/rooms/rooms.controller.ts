import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) { }

    @Get()
    async listRooms(
        @Query('status') status?: string,
        @Query('type') type?: string,
        @Query('page') page?: string,
    ) {
        return this.roomsService.listRooms({ status, type }, parseInt(page || '1'));
    }

    @UseGuards(JwtAuthGuard)
    @Get('mine')
    async getMyRooms(@Request() req: any) {
        return this.roomsService.getUserRooms(req.user.sub);
    }

    @Get(':id')
    async getRoom(@Param('id') id: string) {
        return this.roomsService.findById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createRoom(@Request() req: any, @Body() dto: CreateRoomDto) {
        return this.roomsService.create(req.user.sub, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/join')
    async joinRoom(@Request() req: any, @Param('id') id: string) {
        return this.roomsService.joinRoom(req.user.sub, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/agree')
    async agreeToRoadmap(@Request() req: any, @Param('id') id: string) {
        return this.roomsService.agreeToRoadmap(req.user.sub, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/start')
    async startRoom(@Request() req: any, @Param('id') id: string) {
        return this.roomsService.startRoomIfReady(req.user.sub, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/complete')
    async completeRoom(@Param('id') id: string) {
        return this.roomsService.completeRoom(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/notify')
    async notifyPlayers(@Request() req: any, @Param('id') id: string) {
        return this.roomsService.pokePlayers(req.user.sub, id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/report')
    async reportWinner(@Request() req: any, @Param('id') id: string) {
        return this.roomsService.reportWinner(req.user.sub, id);
    }
}
