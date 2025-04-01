import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Tìm user theo email
    const user = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Tạo JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Lưu phiên vào DB
    await this.prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        isActive: true,
      },
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // Logout: Vô hiệu hóa phiên
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

  // Lấy danh sách phiên của user
  async getUserSessions(userId: number) {
    return this.prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        token: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }
}
