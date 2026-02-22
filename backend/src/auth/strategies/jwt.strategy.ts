import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService, private config: ConfigService) {
        console.log('JwtStrategy Secret Prefix:', (config.get('JWT_SECRET') || '').substring(0, 10));
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET') || 'rivalry-secret-key-change-in-production',
        });
    }

    async validate(payload: { sub: string; email: string }) {
        console.log('JwtStrategy Validate Payload:', payload);
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, role: true, status: true } });
        console.log('JwtStrategy Found User:', user ? 'YES' : 'NO', user?.id);
        if (!user) return null;
        return { id: user.id, sub: user.id, email: user.email, role: user.role, status: user.status };
    }
}
