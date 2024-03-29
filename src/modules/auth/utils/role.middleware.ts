import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RoleEnum } from '../../../common/enum/enum'; 

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: RoleEnum[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false; // Không xác thực được hoặc không có vai trò
    }

    const hasPermission = this.allowedRoles.includes(user.role);
    return hasPermission;
  }
}
