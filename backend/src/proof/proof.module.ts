import { Module, forwardRef } from '@nestjs/common';
import { ProofService } from './proof.service';
import { ProofController } from './proof.controller';
import { RoomsModule } from '../rooms/rooms.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    imports: [
        forwardRef(() => RoomsModule),
        forwardRef(() => GatewayModule),
    ],
    controllers: [ProofController],
    providers: [ProofService],
    exports: [ProofService],
})
export class ProofModule { }
