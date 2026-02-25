import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { WalletModule } from '../wallet/wallet.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    imports: [
        WalletModule,
        GatewayModule,
    ],
    providers: [SchedulerService],
})
export class SchedulerModule { }
