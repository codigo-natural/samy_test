import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  ReqresGetUserResponse,
  ReqresLoginResponse,
  ReqresUser,
} from './reqres.types';

@Injectable()
export class ReqresService {
  private readonly client: AxiosInstance;
  private readonly allowFallback: boolean;

  private readonly fallbackUsers: Record<number, ReqresUser> = {
    1: { id: 1, email: 'george.bluth@reqres.in', first_name: 'George', last_name: 'Bluth', avatar: 'https://reqres.in/img/faces/1-image.jpg' },
    2: { id: 2, email: 'janet.weaver@reqres.in', first_name: 'Janet', last_name: 'Weaver', avatar: 'https://reqres.in/img/faces/2-image.jpg' },
    3: { id: 3, email: 'emma.wong@reqres.in', first_name: 'Emma', last_name: 'Wong', avatar: 'https://reqres.in/img/faces/3-image.jpg' },
  };
  constructor(private readonly configService: ConfigService) {
    const baseURL = this.configService.get<string>('configuration.reqres.baseUrl');
    const timeout = this.configService.get<number>('configuration.reqres.timeoutMs');

    this.allowFallback = String(process.env.REQRES_ALLOW_FALLBACK).toLowerCase() === 'true';

    const apiKey = this.configService.get<string>('configuration.reqres.apiKey');
    this.client = axios.create({
      baseURL,
      timeout,
      headers: { 'x-api-key': apiKey },
    });

    this.client.interceptors.request.use((config) => {
      const requestId = (config as unknown as { requestId?: string }).requestId;
      if (requestId) {
        config.headers = {
          ...((config.headers as unknown as Record<string, unknown>) ?? {}),
          'X-Request-ID': requestId,
        } as never;
      }
      return config;
    });
  }

  async login(email: string, password: string, requestId?: string): Promise<string> {
    try {
      const res = await this.client.post<ReqresLoginResponse>(
        '/login',
        { email, password },
        {
          ...(requestId ? { requestId } : {}),
        } as never,
      );
      return res.data.token;
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;

      if (this.allowFallback) {
        return 'fallback-reqres-token';
      }

      if (status === 400) {
        throw new UnauthorizedException('Invalid credentials');
      }

      throw new BadGatewayException('ReqRes login failed');
    }
  }

  async getUser(id: number, requestId?: string): Promise<ReqresUser> {
    try {
      const res = await this.client.get<ReqresGetUserResponse>(
        `/users/${id}`,
        {
          ...(requestId ? { requestId } : {}),
        } as never,
      );
      return res.data.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) {
        throw new NotFoundException('User not found');
      }

      const status = axiosErr.response?.status;
      const fallback = this.fallbackUsers[id];
      if (this.allowFallback && fallback && (status === 401 || status === 403)) {
        return fallback;
      }
      throw new BadGatewayException('ReqRes get user failed');
    }
  }
}
