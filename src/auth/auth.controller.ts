import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UnauthorizedException,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Request } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

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
    return this.authService.getUserSessions(userId);
  }

  @Post('sessions/:id/logout')
  logoutSession(
    @Req() req: AuthRequest,
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    const userId = req.user.sub;
    return this.authService.logoutSession(userId, sessionId);
  }

  @Post('logout-all')
  logoutAll(@Req() req: AuthRequest) {
    const userId = req.user.sub;
    return this.authService.logoutAllSessions(userId);
  }

  @Get('me')
  async getProfile(@Req() req: AuthRequest) {
    return this.authService.getProfile(req.user.sub);
  }

  @Public()
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftLogin(): Promise<void> {
    // Passport tự động redirect, không cần return
  }

  @Public()
  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftLoginCallback(@Req() req: AuthRequest) {
    const microsoftProfile = {
      microsoftId: req.user.sub.toString(),
      email: req.user.email,
      name: '', // Provide a default or fetch the name
      accessToken: '', // Provide a default or fetch the access token
    };
    const user = await this.authService.validateMicrosoftUser(microsoftProfile);
    return this.authService.loginMicrosoft(user);
  }
}
