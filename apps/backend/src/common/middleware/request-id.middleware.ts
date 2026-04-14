import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const existing = req.header('X-Request-ID');
    const requestId = existing && existing.trim().length > 0 ? existing : uuidv4();

    const reqWithRequestId = req as Request & { requestId?: string };
    reqWithRequestId.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    next();
  }
}
