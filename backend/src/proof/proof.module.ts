import { Module, forwardRef } from '@nestjs/common';
import { ProofService } from './proof.service';
import { ProofController } from './proof.controller';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
    imports: [forwardRef(() => RoomsModule)],
    controllers: [ProofController],
    providers: [ProofService],
    exports: [ProofService],
})
export class ProofModule { }
