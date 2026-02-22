import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async signup(dto: SignupDto) {
        const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existingEmail) throw new ConflictException('Email already in use');

        const existingUsername = await this.prisma.user.findUnique({ where: { username: dto.username } });
        if (existingUsername) throw new ConflictException('Username already taken');

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                username: dto.username,
                passwordHash,
                bio: dto.bio,
                profile: { create: {} },
                wallet: { create: {} },
            },
            include: { profile: true, wallet: true },
        });

        const tokens = await this.generateTokens(user.id, user.email);
        return { user: this.sanitizeUser(user), ...tokens };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { profile: true, wallet: true },
        });
        if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.generateTokens(user.id, user.email);
        return { user: this.sanitizeUser(user), ...tokens };
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true, wallet: true },
        });
        if (!user) throw new UnauthorizedException('User not found');
        return this.sanitizeUser(user);
    }

    private async generateTokens(userId: string, email: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
        const payload = { sub: userId, email, role: user?.role || 'user' };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
        return { accessToken, refreshToken };
    }

    private sanitizeUser(user: any) {
        const { passwordHash, ...safe } = user;
        return safe;
    }
}
