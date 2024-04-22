import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RoleEnum } from '../../../common/enum/enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: RoleEnum[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const hasPermission = this.allowedRoles.some((role) => user.role === role);

    return hasPermission;
  }
}
