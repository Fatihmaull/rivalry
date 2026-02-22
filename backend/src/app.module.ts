import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
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
    ],
})
export class AppModule { }
