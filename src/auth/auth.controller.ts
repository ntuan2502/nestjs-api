import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Request } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { Public } from 'src/common/decorators/public.decorator';

interface AuthRequest extends Request {
  user: { sub: number; email: string };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, req);
  }

  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refresh(refreshTokenDto, req);
  }

  @Post('logout')
  logout(@Req() req: AuthRequest) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    return this.authService.logout(token);
  }

  @Get('sessions')
  getSessions(@Req() req: AuthRequest) {
    const userId = req.user.sub;
    return this.authService.getSessions(userId);
  }

  @Public()
  @Post('logout-session')
  logoutSession(@Body() userData: { accessToken: string; userId: number }) {
    const { accessToken, userId } = userData;
    if (!userId) {
      throw new UnauthorizedException('userId not found');
    }
    if (!accessToken) {
      throw new UnauthorizedException('accessToken not found');
    }
    return this.authService.logoutSession(Number(userId), accessToken);
  }

  @Post('logout-all')
  logoutAll(@Req() req: AuthRequest) {
    const userId = req.user.sub;
    return this.authService.logoutAll(userId);
  }

  @Get('profile')
  async getProfile(@Req() req: AuthRequest) {
    return this.authService.getProfile(req.user.sub);
  }
}
