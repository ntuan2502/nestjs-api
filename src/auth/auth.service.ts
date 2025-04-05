import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  // Helper để lấy IP thực từ headers
  private getClientIp(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      // X-Forwarded-For có thể là string hoặc string[], lấy IP đầu tiên
      const ipList = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ipList.trim() || 'unknown';
    }
    // Fallback về X-Real-IP nếu có
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp || 'unknown';
    }
    // Fallback cuối cùng về req.ip
    return req.ip || 'unknown';
  }

  async login(loginDto: LoginDto, req: Request) {
    const { email, password } = loginDto;

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

    // Lấy IP thực của client
    const ipAddress = this.getClientIp(req);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        refreshTokenExpiresAt,
        isActive: true,
        ipAddress,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto, req: Request) {
    const { refreshToken } = refreshTokenDto;

    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh token');
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

    // Lấy IP thực của client
    const ipAddress = this.getClientIp(req);

    await this.prisma.session.update({
      where: { refreshToken },
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        lastRefreshedAt: new Date(),
        ipAddress,
      },
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { token },
    });
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Invalid or already logged out session');
    }

    await this.prisma.session.update({
      where: { token },
      data: { isActive: false },
    });

    return { message: 'Logged out successfully' };
  }

  async logoutSession(userId: number, sessionId: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    if (session.userId !== userId) {
      throw new UnauthorizedException('You can only logout your own sessions');
    }
    if (!session.isActive) {
      throw new UnauthorizedException('Session already logged out');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    return { message: `Session ${sessionId} logged out successfully` };
  }

  async logoutAllSessions(userId: number) {
    const activeSessions = await this.prisma.session.findMany({
      where: { userId, isActive: true },
    });

    if (activeSessions.length === 0) {
      return { message: 'No active sessions to logout' };
    }

    await this.prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    return { message: `Logged out ${activeSessions.length} active sessions` };
  }

  async getUserSessions(userId: number) {
    return this.prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        token: true,
        refreshToken: true,
        refreshTokenExpiresAt: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
        lastRefreshedAt: true,
        ipAddress: true,
      },
    });
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
}
