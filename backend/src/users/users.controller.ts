import { Controller, Get, Put, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('search')
    async search(@Query('q') query: string) {
        return this.usersService.searchUsers(query || '');
    }

    @Get(':id')
    async getUser(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Get('username/:username')
    async getByUsername(@Param('username') username: string) {
        return this.usersService.findByUsername(username);
    }

    @UseGuards(JwtAuthGuard)
    @Put('profile')
    async updateProfile(@Request() req: any, @Body() body: { bio?: string; interests?: string[]; skillLevel?: string }) {
        return this.usersService.updateProfile(req.user.sub, body);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/follow')
    async follow(@Request() req: any, @Param('id') id: string) {
        return this.usersService.follow(req.user.sub, id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/follow')
    async unfollow(@Request() req: any, @Param('id') id: string) {
        return this.usersService.unfollow(req.user.sub, id);
    }

    @Get(':id/followers')
    async getFollowers(@Param('id') id: string) {
        return this.usersService.getFollowers(id);
    }

    @Get(':id/following')
    async getFollowing(@Param('id') id: string) {
        return this.usersService.getFollowing(id);
    }

    @Get(':id/stats')
    async getStats(@Param('id') id: string) {
        return this.usersService.getStats(id);
    }
}
