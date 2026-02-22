import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createPost(@Request() req: any, @Body() body: { type: string; content: string; imageUrl?: string; roomId?: string }) {
        return this.feedService.createPost(req.user.sub, body);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getFeed(@Request() req: any, @Query('page') page?: string) {
        return this.feedService.getFeed(req.user.sub, parseInt(page || '1'));
    }

    @Get('explore')
    async getExplore(@Query('page') page?: string) {
        return this.feedService.getExploreFeed(parseInt(page || '1'));
    }

    @UseGuards(JwtAuthGuard)
    @Post(':postId/comments')
    async addComment(@Request() req: any, @Param('postId') postId: string, @Body() body: { content: string }) {
        return this.feedService.addComment(req.user.sub, postId, body.content);
    }

    @Get(':postId/comments')
    async getComments(@Param('postId') postId: string) {
        return this.feedService.getComments(postId);
    }
}
