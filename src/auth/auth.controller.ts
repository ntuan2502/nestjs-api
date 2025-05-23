import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
  Res,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Request, Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { AuthGuard } from '@nestjs/passport';
import { MicrosoftRequest } from 'src/common/interfaces/auth.interface';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  login(@Req() req: Request, @Body() loginDto: LoginDto) {
    return this.authService.login(req, loginDto);
  }

  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Public()
  @Post('refresh')
  refresh(@Req() req: Request, @Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(req, refreshTokenDto);
  }

  @Post('logout')
  logout(@Req() req: AuthRequest) {
    return this.authService.logout(req);
  }

  @Get('sessions')
  getSessions(@Req() req: AuthRequest) {
    return this.authService.getSessions(req);
  }

  @Public()
  @Post('logout-session')
  logoutSession(@Body() userData: { userId: string; accessToken: string }) {
    const { userId, accessToken } = userData;
    if (!userId) {
      throw new UnauthorizedException('userId not found');
    }
    if (!accessToken) {
      throw new UnauthorizedException('accessToken not found');
    }
    return this.authService.logoutSession(userId, accessToken);
  }

  @Post('logout-all')
  logoutAll(@Req() req: AuthRequest) {
    return this.authService.logoutAll(req);
  }

  @Get('profile')
  async getProfile(@Req() req: AuthRequest) {
    return this.authService.getProfile(req);
  }

  @Post('profile')
  async updateProfile(
    @Req() req: AuthRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req, updateProfileDto);
  }

  @Post('change-password')
  changePassword(
    @Req() req: AuthRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req, changePasswordDto);
  }

  @Public()
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  redirectToMicrosoft(): void {
    // Passport sẽ tự redirect
  }

  @Public()
  @Get('microsoft/redirect')
  @UseGuards(AuthGuard('microsoft'))
  async handleMicrosoftRedirect(
    @Req() req: MicrosoftRequest,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.loginWithMicrosoft(req);

    const frontendRedirectUrl = new URL(
      this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000') +
        '/auth/callback',
    );
    frontendRedirectUrl.searchParams.set('accessToken', result.accessToken);
    frontendRedirectUrl.searchParams.set('refreshToken', result.refreshToken);
    frontendRedirectUrl.searchParams.set('id', result.user.id);
    frontendRedirectUrl.searchParams.set('email', result.user.email);
    frontendRedirectUrl.searchParams.set('name', result.user.name || '');

    res.redirect(frontendRedirectUrl.toString());
  }
}
