import { Module } from '@nestjs/common';
import { ObserverService } from './observer.service';
import { ObserverController } from './observer.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
    imports: [WalletModule],
    controllers: [ObserverController],
    providers: [ObserverService],
    exports: [ObserverService],
})
export class ObserverModule { }
