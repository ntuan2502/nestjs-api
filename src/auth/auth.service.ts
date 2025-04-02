import { Injectable, UnauthorizedException } from '@nestjs/common';
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

    // Tạo access token và refresh token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.EXPIRES_IN || '15m',
    }); // Ngắn hạn: 15 phút
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' }); // Dài hạn: 7 ngày

    // Lưu phiên vào DB
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

    // Tìm session theo refresh token
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Xác minh refresh token
    let payload: { sub: number; email: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Tạo access token mới
    const newAccessToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      { expiresIn: process.env.EXPIRES_IN || '15m' },
    );

    // Cập nhật access token trong session
    await this.prisma.session.update({
      where: { refreshToken },
      data: { token: newAccessToken },
    });

    return {
      access_token: newAccessToken,
      refresh_token: refreshToken, // Giữ nguyên refresh token cũ
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

  async getUserSessions(userId: number) {
    return this.prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        token: true,
        refreshToken: true, // Thêm refreshToken vào response
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }
}
