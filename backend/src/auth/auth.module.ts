import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const secret = config.get<string>('JWT_SECRET');
                if (!secret) {
                    throw new Error(
                        'JWT_SECRET environment variable is not set. ' +
                        'Please set it before starting the application.',
                    );
                }
                return {
                    secret,
                    signOptions: { expiresIn: '7d' },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, GoogleStrategy],
    exports: [AuthService],
})
export class AuthModule { }
