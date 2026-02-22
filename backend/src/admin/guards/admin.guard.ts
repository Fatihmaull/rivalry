import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) throw new ForbiddenException('Not authenticated');
        if (user.role !== 'admin' && user.role !== 'super_admin') {
            throw new ForbiddenException('Admin access required');
        }
        return true;
    }
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) throw new ForbiddenException('Not authenticated');
        if (user.role !== 'super_admin') {
            throw new ForbiddenException('Super admin access required');
        }
        return true;
    }
}
