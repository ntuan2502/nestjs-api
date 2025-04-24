import {
  Injectable,
  UnauthorizedException,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { omitFields } from 'src/common/utils/omit';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  private getClientIp(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ipList = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ipList.trim() || 'unknown';
    }
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp || 'unknown';
    }
    return req.ip || 'unknown';
  }

  private parseLifetimeToDays(lifetime: string): number {
    const match = lifetime.match(/^(\d+)([dhm])$/);
    if (!match) return 7;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 'd':
        return value;
      case 'h':
        return value / 24;
      case 'm':
        return value / (24 * 60);
      default:
        return 7;
    }
  }

  async login(loginDto: LoginDto, req: Request) {
    const { email, password } = loginDto;
    const userAgent = req.headers['user-agent'];

    const user = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_LIFETIME', '7d'),
    });

    const refreshTokenExpiresAt = new Date();
    const lifetimeDays = this.parseLifetimeToDays(
      this.configService.get<string>('REFRESH_TOKEN_LIFETIME', '7d'),
    );
    refreshTokenExpiresAt.setDate(
      refreshTokenExpiresAt.getDate() + lifetimeDays,
    );

    const ipAddress = this.getClientIp(req);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
        isActive: true,
        ipAddress,
        userAgent,
      },
    });

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: omitFields(user, ['password']),
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto, req: Request) {
    const { refreshToken } = refreshTokenDto;

    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });
    if (!session) {
      throw new BadRequestException('Session not found');
    }
    if (!session.isActive) {
      throw new BadRequestException('Session already logged out');
    }

    const now = new Date();
    if (!session.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Refresh token expiration not set');
    }
    if (now > session.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (session.lastRefreshedAt) {
      const timeSinceLastRefresh =
        now.getTime() - session.lastRefreshedAt.getTime();
      if (timeSinceLastRefresh < 1000 * 60) {
        throw new UnauthorizedException('Refresh token used too frequently');
      }
    }

    let payload: { sub: number; email: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.jwtService.sign({
      sub: payload.sub,
      email: payload.email,
    });

    const timeLeftMs = session.refreshTokenExpiresAt.getTime() - now.getTime();
    if (timeLeftMs <= 0) {
      throw new UnauthorizedException('Refresh token has expired');
    }
    const timeLeftSeconds = Math.floor(timeLeftMs / 1000);
    const newRefreshToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      { expiresIn: `${timeLeftSeconds}s` },
    );

    const ipAddress = this.getClientIp(req);

    await this.prisma.session.update({
      where: { refreshToken },
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        lastRefreshedAt: new Date(),
        ipAddress,
      },
    });

    return {
      message: 'Refresh token successful',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(accessToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { accessToken },
    });
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Invalid or already logged out session');
    }

    await this.prisma.session.update({
      where: { accessToken },
      data: { isActive: false },
    });

    return { message: 'Logged out successfully' };
  }

  async logoutSession(userId: number, accessToken: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        accessToken,
        userId,
      },
    });

    if (!session) {
      throw new BadRequestException('Session not found');
    }
    if (session.userId !== userId) {
      throw new ForbiddenException('You can only logout your own sessions');
    }
    if (!session.isActive) {
      throw new BadRequestException('Session already logged out');
    }

    await this.prisma.session.update({
      where: { accessToken },
      data: { isActive: false },
    });

    return { message: `Logged out successfully` };
  }

  async logoutAll(userId: number) {
    const activeSessions = await this.prisma.session.findMany({
      where: { userId, isActive: true },
    });

    if (activeSessions.length === 0) {
      throw new BadRequestException('No active sessions to logout');
    }

    await this.prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    return { message: `Logged out ${activeSessions.length} active sessions` };
  }

  async getSessions(userId: number) {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: {
        id: 'desc',
      },
    });

    return {
      message: 'Sessions retrieved successfully',
      sessions,
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        office: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      message: 'Profile retrieved successfully',
      user: omitFields(user, ['password']),
    };
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userId: number) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }
}
