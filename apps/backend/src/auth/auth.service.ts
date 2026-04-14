import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { ReqresService } from '../external/reqres/reqres.service';
import { Role } from '../common/guards/roles.guard';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly reqresService: ReqresService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(req: Request, res: Response, email: string, password: string): Promise<void> {
    const requestId = (req as Request & { requestId?: string }).requestId;

    await this.reqresService.login(email, password, requestId);

    const role: Role = await this.usersService.getRoleByEmail(email);
    const secret = this.configService.get<string>('configuration.jwt.secret') as string;
    const expiresIn = this.configService.get<string>('configuration.jwt.expiresIn') as unknown as never;

    const token = await this.jwtService.signAsync(
      {
        sub: email,
        role,
      },
      {
        secret,
        expiresIn,
      },
    );

    const cookieDomain = this.configService.get<string>('configuration.cookie.domain') as string;
    const nodeEnv = this.configService.get<string>('configuration.app.nodeEnv') ?? 'development';
    const cookieName =
      this.configService.get<string>('configuration.cookie.jwtCookieName') ?? 'auth';

    const sameSite = nodeEnv === 'production' ? 'strict' : 'lax';

    res.cookie(cookieName, token, {
      httpOnly: true,
      sameSite,
      secure: nodeEnv === 'production',
      domain: cookieDomain,
      path: '/',
    });
  }

  logout(res: Response): void {
    const cookieName =
      this.configService.get<string>('configuration.cookie.jwtCookieName') ?? 'auth';

    res.clearCookie(cookieName, {
      path: '/',
    });
  }
}
