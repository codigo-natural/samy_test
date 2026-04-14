import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import pino, { Logger } from 'pino';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    const level =
      this.configService.get<string>('configuration.app.logLevel') ?? 'info';

    this.logger = pino({
      level,
      base: undefined,
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const reqMeta = req as Request & { requestId?: string; userId?: string };

    const start = Date.now();

    return next.handle().pipe(
      finalize(() => {
        const durationMs = Date.now() - start;

        this.logger.info({
          requestId: reqMeta.requestId,
          method: req.method,
          path: req.originalUrl ?? req.url,
          statusCode: res.statusCode,
          durationMs,
          userId: reqMeta.userId,
          environment:
            this.configService.get<string>('configuration.app.nodeEnv') ??
            process.env.NODE_ENV,
        });
      }),
    );
  }
}
