import { Controller, Get, Post, Put, Delete, Query, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard, SuperAdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private adminService: AdminService) { }

    // ─── Dashboard ────────────────────────────────────────────
    @Get('dashboard')
    getStats() { return this.adminService.getDashboardStats(); }

    @Get('dashboard/activity')
    getActivity(@Query('limit') limit?: string) { return this.adminService.getRecentActivity(limit ? +limit : 20); }

    @Get('dashboard/growth')
    getGrowth() { return this.adminService.getGrowthData(); }

    // ─── Users ────────────────────────────────────────────────
    @Get('users')
    getUsers(@Query() query: any) { return this.adminService.getUsers(query); }

    @Post('users/:id/suspend')
    suspendUser(@Request() req: any, @Param('id') id: string) { return this.adminService.suspendUser(req.user.id, id); }

    @Post('users/:id/ban')
    banUser(@Request() req: any, @Param('id') id: string) { return this.adminService.banUser(req.user.id, id); }

    @Post('users/:id/activate')
    activateUser(@Request() req: any, @Param('id') id: string) { return this.adminService.activateUser(req.user.id, id); }

    @Post('users/:id/verify')
    verifyUser(@Request() req: any, @Param('id') id: string) { return this.adminService.verifyUser(req.user.id, id); }

    @Put('users/:id/role')
    changeRole(@Request() req: any, @Param('id') id: string, @Body('role') role: string) {
        return this.adminService.changeUserRole(req.user.id, id, role);
    }

    @Post('users/:id/reset-wallet')
    resetWallet(@Request() req: any, @Param('id') id: string) { return this.adminService.resetUserWallet(req.user.id, id); }

    @Delete('users/:id')
    deleteUser(@Request() req: any, @Param('id') id: string) { return this.adminService.deleteUser(req.user.id, id); }

    @Post('users/:userId/rooms/:roomId/remove')
    removeFromRoom(@Request() req: any, @Param('userId') userId: string, @Param('roomId') roomId: string) {
        return this.adminService.removeUserFromRoom(req.user.id, userId, roomId);
    }

    // ─── Rooms ────────────────────────────────────────────────
    @Get('rooms')
    getRooms(@Query() query: any) { return this.adminService.getRooms(query); }

    @Post('rooms/:id/cancel')
    cancelRoom(@Request() req: any, @Param('id') id: string) { return this.adminService.cancelRoom(req.user.id, id); }

    @Post('rooms/:id/force-end')
    forceEnd(@Request() req: any, @Param('id') id: string) { return this.adminService.forceEndRoom(req.user.id, id); }

    @Post('rooms/:id/refund')
    refundRoom(@Request() req: any, @Param('id') id: string) { return this.adminService.refundRoom(req.user.id, id); }

    // ─── Transactions ─────────────────────────────────────────
    @Get('transactions')
    getTransactions(@Query() query: any) { return this.adminService.getTransactions(query); }

    @Post('wallets/:userId/freeze')
    freezeWallet(@Request() req: any, @Param('userId') userId: string) { return this.adminService.freezeWallet(req.user.id, userId); }

    @Post('wallets/:userId/unfreeze')
    unfreezeWallet(@Request() req: any, @Param('userId') userId: string) { return this.adminService.unfreezeWallet(req.user.id, userId); }

    @Post('transactions/:id/reverse')
    reverseTransaction(@Request() req: any, @Param('id') id: string) { return this.adminService.reverseTransaction(req.user.id, id); }

    @Post('transactions/:id/flag')
    flagTransaction(@Request() req: any, @Param('id') id: string) { return this.adminService.flagTransaction(req.user.id, id); }

    // ─── Interests ────────────────────────────────────────────
    @Get('interests')
    getInterests() { return this.adminService.getInterests(); }

    @Post('interests')
    createInterest(@Request() req: any, @Body() body: any) { return this.adminService.createInterest(req.user.id, body); }

    @Put('interests/:id')
    updateInterest(@Request() req: any, @Param('id') id: string, @Body() body: any) { return this.adminService.updateInterest(req.user.id, id, body); }

    @Delete('interests/:id')
    deleteInterest(@Request() req: any, @Param('id') id: string) { return this.adminService.deleteInterest(req.user.id, id); }

    // ─── Analytics ────────────────────────────────────────────
    @Get('analytics')
    getAnalytics() { return this.adminService.getAnalytics(); }

    // ─── System Settings (Super Admin Only) ───────────────────
    @Get('system')
    getSystemSettings() { return this.adminService.getSystemSettings(); }

    @Put('system/:key')
    @UseGuards(SuperAdminGuard)
    updateSetting(@Request() req: any, @Param('key') key: string, @Body('value') value: string) {
        return this.adminService.updateSystemSetting(req.user.id, key, value);
    }

    // ─── Audit Logs ───────────────────────────────────────────
    @Get('audit-logs')
    getAuditLogs(@Query() query: any) { return this.adminService.getAuditLogs(query); }
}
