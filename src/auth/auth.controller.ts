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
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

interface AuthRequest extends Request {
  user: { sub: number; email: string };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, req);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refresh(refreshTokenDto, req);
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
  logoutAll(@Req() req: AuthRequest) {
    const userId = req.user.sub;
    return this.authService.logoutAllSessions(userId);
  }

  // Thêm endpoint /auth/me
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthRequest) {
    return this.authService.getProfile(req.user.sub);
  }
}
