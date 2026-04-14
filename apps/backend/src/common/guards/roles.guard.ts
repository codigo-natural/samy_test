import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const ROLES_KEY = 'roles';

export type Role = 'VIEWER' | 'EDITOR' | 'ADMIN';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const reqWithRole = req as Request & { userRole?: Role };
    const role = reqWithRole.userRole;

    if (!role || !roles.includes(role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
