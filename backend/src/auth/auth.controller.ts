import { Controller, Post, Body, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Post('signup')
    async signup(@Body() dto: SignupDto) {
        return this.authService.signup(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() req: any) {
        return this.authService.validateUser(req.user.sub);
    }

    // Google OAuth endpoints
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Passport redirects to Google — this method body is never reached
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Request() req: any, @Res() res: Response) {
        const result = await this.authService.googleLogin(req.user);
        const frontendUrl = this.configService.get<string>('CORS_ORIGIN')?.split(',')[0] || 'http://localhost:3000';
        // Redirect to frontend with token in query param
        res.redirect(`${frontendUrl}/login?token=${result.accessToken}`);
    }
}
