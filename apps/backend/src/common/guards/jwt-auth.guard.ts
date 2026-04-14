import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const reqMeta = req as Request & { userId?: string; userRole?: string };
    const cookieName =
      this.configService.get<string>('configuration.cookie.jwtCookieName') ??
      'auth';

    const token = req.cookies?.[cookieName];

    if (!token) {
      throw new UnauthorizedException('Missing auth cookie');
    }

    try {
      const secret = this.configService.get<string>('configuration.jwt.secret');
      if (!secret) {
        throw new UnauthorizedException('JWT secret not configured');
      }

      const payload = this.jwtService.verify<JwtPayload>(token, { secret });
      reqMeta.userId = payload.sub;
      reqMeta.userRole = payload.role;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
