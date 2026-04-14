import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Get current session claims' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    const meta = req as Request & { userId?: string; userRole?: string };
    return { email: meta.userId, role: meta.userRole };
  }

  @ApiOperation({ summary: 'Login via ReqRes and set JWT cookie' })
  @ApiResponse({ status: 204, description: 'Logged in' })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ): Promise<void> {
    await this.authService.login(req, res, dto.email, dto.password);
    res.status(204);
  }

  @ApiOperation({ summary: 'Logout and clear JWT cookie' })
  @ApiResponse({ status: 204, description: 'Logged out' })
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): void {
    this.authService.logout(res);
    res.status(204);
  }
}
