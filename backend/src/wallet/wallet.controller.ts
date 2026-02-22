import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get()
    async getWallet(@Request() req: any) {
        return this.walletService.getWallet(req.user.sub);
    }

    @Post('topup')
    async topUp(@Request() req: any, @Body() body: { amount: number }) {
        return this.walletService.topUp(req.user.sub, body.amount);
    }

    @Post('withdraw')
    async withdraw(@Request() req: any, @Body() body: { amount: number }) {
        return this.walletService.withdraw(req.user.sub, body.amount);
    }
}
