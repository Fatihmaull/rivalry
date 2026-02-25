import { Module, forwardRef } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { WalletModule } from '../wallet/wallet.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    imports: [
        WalletModule,
        forwardRef(() => GatewayModule),
    ],
    controllers: [RoomsController],
    providers: [RoomsService],
    exports: [RoomsService],
})
export class RoomsModule { }
