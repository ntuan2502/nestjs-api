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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import {
  JwtPayload,
  MicrosoftRequest,
} from 'src/common/interfaces/auth.interface';
import { getClientIp, parseLifetimeToDays } from 'src/common/utils/function';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ADMIN_ID, DEFAULT_PASSWORD } from 'src/common/const';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  private async fetchAndSaveMicrosoftAvatar(
    accessToken: string,
    name: string,
  ): Promise<string | null> {
    try {
      // Fetch avatar từ Microsoft Graph API
      const response = await axios.get(
        'https://graph.microsoft.com/v1.0/me/photo/$value',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: 'arraybuffer', // để nhận binary (ảnh)
        },
      );

      // Tạo đường dẫn lưu ảnh
      const filename = `${name.replace(/\s+/g, '_')}.png`; // tránh khoảng trắng
      const avatarDir = path.join(process.cwd(), 'public', 'avatar');
      const avatarPath = path.join(avatarDir, filename);

      // Kiểm tra và tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(avatarDir)) {
        fs.mkdirSync(avatarDir, { recursive: true });
      }

      // Ghi file ra đĩa
      fs.writeFileSync(avatarPath, Buffer.from(response.data), 'binary');

      // Trả về đường dẫn tương đối có thể dùng ở FE
      return `/public/avatar/${filename}`;
    } catch (error) {
      console.error('Không thể lấy hoặc lưu avatar:', error.message);
      return null;
    }
  }

  private async validateUnique(email: string, exclude?: string) {
    const data = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        ...(exclude ? { NOT: { id: exclude } } : {}),
      },
    });

    if (data) {
      throw new BadRequestException(`user with email ${email} already exists`);
    }
  }

  async login(req: Request, loginDto: LoginDto) {
    const { email, password } = loginDto;
    const userAgent = req.headers['user-agent'];

    const user = await this.prisma.user.findFirst({
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
    const lifetimeDays = parseLifetimeToDays(
      this.configService.get<string>('REFRESH_TOKEN_LIFETIME', '7d'),
    );
    refreshTokenExpiresAt.setDate(
      refreshTokenExpiresAt.getDate() + lifetimeDays,
    );

    const ipAddress = getClientIp(req);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
        isActive: true,
        ipAddress,
        userAgent: userAgent || 'unknown',
        createdById: user.id,
      },
    });

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: omitFields(user, ['password']),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto;
    await this.validateUnique(email);

    const defaultPassword = password || DEFAULT_PASSWORD;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        email,
        password: hashedPassword,
        createdById: ADMIN_ID,
      },
    });

    return {
      message: 'User created successfully',
      user: omitFields(user, ['password']),
    };
  }

  async refresh(req: Request, refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const session = await this.prisma.session.findFirst({
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

    const ipAddress = getClientIp(req);

    await this.prisma.session.update({
      where: { accessToken: session.accessToken },
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

  async logout(req: AuthRequest) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('No accessToken provided');
    }

    const session = await this.prisma.session.findFirst({
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

  async logoutSession(userId: string, accessToken: string) {
    const session = await this.prisma.session.findFirst({
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

  async logoutAll(req: AuthRequest) {
    const userId = req.user.sub;
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

  async getSessions(req: AuthRequest) {
    const userId = req.user.sub;
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

  async getProfile(req: AuthRequest) {
    const userId = req.user.sub;
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        office: true,
        department: true,
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

  async updateProfile(req: AuthRequest, updateProfileDto: UpdateProfileDto) {
    const userId = req.user.sub;
    const { name, gender, dob, phone, address, avatar } = updateProfileDto;

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name,
        gender,
        dob,
        phone,
        address,
        avatar,
      },
      include: {
        office: true,
      },
    });

    return {
      message: 'Profile updated successfully',
      user: omitFields(updatedUser, ['password']),
    };
  }

  async changePassword(req: AuthRequest, changePasswordDto: ChangePasswordDto) {
    const userId = req.user.sub;
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findFirst({
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

  async loginWithMicrosoft(req: MicrosoftRequest) {
    const data = req.user;
    const userAgent = req.headers['user-agent'];
    const email = data.profile.emails?.[0]?.value ?? '';
    const msToken = data.accessToken;
    const avatar = await this.fetchAndSaveMicrosoftAvatar(
      msToken,
      data.profile.displayName,
    );

    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { avatar },
      include: {
        office: true,
        department: true,
      },
    });

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_LIFETIME', '7d'),
    });

    const refreshTokenExpiresAt = new Date();
    const lifetimeDays = parseLifetimeToDays(
      this.configService.get<string>('REFRESH_TOKEN_LIFETIME', '7d'),
    );
    refreshTokenExpiresAt.setDate(
      refreshTokenExpiresAt.getDate() + lifetimeDays,
    );

    const ipAddress = getClientIp(req);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
        isActive: true,
        ipAddress,
        userAgent: userAgent || 'unknown',
        createdById: user.id,
      },
    });

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: omitFields(updatedUser, ['password']),
    };
  }
}
