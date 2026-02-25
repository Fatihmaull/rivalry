import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService, private config: ConfigService) {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error(
                'JWT_SECRET environment variable is not set. ' +
                'Please set it before starting the application.',
            );
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: { sub: string; email: string }) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, role: true, status: true },
        });
        if (!user) return null;
        return { id: user.id, sub: user.id, email: user.email, role: user.role, status: user.status };
    }
}
