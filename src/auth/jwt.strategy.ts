import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Định nghĩa interface cho payload của JWT
interface JwtPayload {
  sub: number;
  email: string;
  iat?: number; // Issued at (tùy chọn)
  exp?: number; // Expires at (tùy chọn)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET || 'your-secret-key', // Phải khớp với secret trong JwtModule
    });
  }

  // Bỏ async vì không cần await hiện tại
  validate(payload: JwtPayload) {
    return { sub: payload.sub, email: payload.email };
  }
}
