import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

interface AuthRequest extends Request {
  user: { sub: number; email: string };
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly prisma: PrismaService,
    private reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Cho phép truy cập mà không cần token
    }

    const can = await super.canActivate(context);
    if (!can) return false;

    const request: AuthRequest = context.switchToHttp().getRequest();
    const accessToken = request.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('No access token provided');
    }

    const session = await this.prisma.session.findUnique({
      where: { accessToken }, // Kiểm tra access token
    });

    if (!session || !session.isActive) {
      throw new UnauthorizedException('Session is invalid or logged out');
    }

    await this.prisma.session.update({
      where: { accessToken },
      data: { lastUsedAt: new Date() },
    });

    return true;
  }
}
