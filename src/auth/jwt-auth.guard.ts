import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { sub: number; email: string };
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
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const session = await this.prisma.session.findUnique({
      where: { token }, // Kiểm tra access token
    });

    if (!session || !session.isActive) {
      throw new UnauthorizedException('Session is invalid or logged out');
    }

    await this.prisma.session.update({
      where: { token },
      data: { lastUsedAt: new Date() },
    });

    return true;
  }
}
