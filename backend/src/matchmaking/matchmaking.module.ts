import { Module, forwardRef } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { MatchmakingController } from './matchmaking.controller';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
    imports: [forwardRef(() => RoomsModule)],
    controllers: [MatchmakingController],
    providers: [MatchmakingService],
    exports: [MatchmakingService],
})
export class MatchmakingModule { }
