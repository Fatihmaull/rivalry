import { Module } from '@nestjs/common';
import { RivalryGateway } from './rivalry.gateway';

@Module({
    providers: [RivalryGateway],
    exports: [RivalryGateway],
})
export class GatewayModule { }
