import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Thêm ConfigService
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  async login(loginDto: LoginDto) {
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
    const accessToken = this.jwtService.sign(payload); // Dùng expiresIn từ JwtModule
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d',
    });

    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        isActive: true,
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

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh token');
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

    await this.prisma.session.update({
      where: { refreshToken },
      data: { token: newAccessToken },
    });

    return {
      access_token: newAccessToken,
      refresh_token: refreshToken,
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
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }
}
