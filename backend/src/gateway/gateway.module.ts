import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RivalryGateway } from './rivalry.gateway';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const secret = config.get<string>('JWT_SECRET');
                if (!secret) {
                    throw new Error('JWT_SECRET environment variable is not set.');
                }
                return { secret };
            },
        }),
    ],
    providers: [RivalryGateway],
    exports: [RivalryGateway],
})
export class GatewayModule { }
