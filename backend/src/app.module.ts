import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, DiscoveryModule, Reflector } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GoalsModule } from './goals/goals.module';
import { WalletModule } from './wallet/wallet.module';
import { RoomsModule } from './rooms/rooms.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { ProofModule } from './proof/proof.module';
import { FeedModule } from './feed/feed.module';
import { ObserverModule } from './observer/observer.module';
import { GatewayModule } from './gateway/gateway.module';
import { AdminModule } from './admin/admin.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { UploadModule } from './upload/upload.module';

@Module({
    imports: [
        DiscoveryModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', 'backend/.env'],
        }),
        ThrottlerModule.forRoot([{
            ttl: 60000,   // 60 seconds window
            limit: 100,   // 100 requests per window
        }]),
        ScheduleModule.forRoot(),
        PrismaModule,
        AuthModule,
        UsersModule,
        GoalsModule,
        WalletModule,
        RoomsModule,
        MatchmakingModule,
        ProofModule,
        FeedModule,
        ObserverModule,
        GatewayModule,
        AdminModule,
        SchedulerModule,
        UploadModule,
    ],
    providers: [
        Reflector,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
