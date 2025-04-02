import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { sub: number; email: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: AuthRequest) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    return this.authService.logout(token);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  getSessions(@Req() req: AuthRequest) {
    const userId = req.user.sub;
    return this.authService.getUserSessions(userId);
  }

  @Post('sessions/:id/logout')
  @UseGuards(JwtAuthGuard)
  logoutSession(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    const userId = req.user.sub;
    return this.authService.logoutSession(userId, sessionId);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  logoutAllSessions(@Req() req: AuthRequest) {
    const userId = req.user.sub;
    return this.authService.logoutAllSessions(userId);
  }
}
