import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { ReqresService } from '../external/reqres/reqres.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  const reqresService = {
    login: jest.fn(),
  };

  const usersService = {
    getRoleByEmail: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'configuration.jwt.secret') return 'secret';
      if (key === 'configuration.jwt.expiresIn') return '8h';
      if (key === 'configuration.cookie.domain') return 'localhost';
      if (key === 'configuration.app.nodeEnv') return 'development';
      if (key === 'configuration.cookie.jwtCookieName') return 'auth';
      return undefined;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ReqresService, useValue: reqresService },
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('issues JWT cookie with role from DB after ReqRes login', async () => {
    (reqresService.login as jest.Mock).mockResolvedValue(undefined);
    (usersService.getRoleByEmail as jest.Mock).mockResolvedValue('ADMIN');
    (jwtService.signAsync as jest.Mock).mockResolvedValue('token');

    const req = { requestId: 'rid-1' } as Partial<Request> as Request;
    const res = { cookie: jest.fn() } as Partial<Response> as Response;

    await service.login(req, res, 'a@b.com', 'pw');

    expect(reqresService.login).toHaveBeenCalledWith('a@b.com', 'pw', 'rid-1');
    expect(usersService.getRoleByEmail).toHaveBeenCalledWith('a@b.com');
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: 'a@b.com', role: 'ADMIN' },
      expect.objectContaining({ secret: 'secret', expiresIn: '8h' }),
    );

    expect(res.cookie).toHaveBeenCalledWith(
      'auth',
      'token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        domain: 'localhost',
        path: '/',
      }),
    );
  });

  it('throws UnauthorizedException when ReqRes login fails', async () => {
    (reqresService.login as jest.Mock).mockRejectedValue(new UnauthorizedException('Invalid credentials'));

    const req = { requestId: 'rid-1' } as Partial<Request> as Request;
    const res = { cookie: jest.fn() } as Partial<Response> as Response;

    await expect(service.login(req, res, 'a@b.com', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(res.cookie).not.toHaveBeenCalled();
  });
});
