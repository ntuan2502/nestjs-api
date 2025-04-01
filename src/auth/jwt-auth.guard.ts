import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

// Định nghĩa interface cho request với user từ JWT (tái sử dụng từ AuthController)
interface AuthRequest extends Request {
  user: { sub: number; email: string }; // Dựa trên validate trong JwtStrategy
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = await super.canActivate(context);
    if (!can) return false;

    const request: AuthRequest = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    const session = await this.prisma.session.findUnique({
      where: { token },
    });

    if (!session || !session.isActive) {
      throw new UnauthorizedException('Session is invalid or logged out');
    }

    // Cập nhật lastUsedAt để theo dõi hoạt động
    await this.prisma.session.update({
      where: { token },
      data: { lastUsedAt: new Date() },
    });

    return true;
  }
}
