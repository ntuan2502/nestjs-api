import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' }, // Token hết hạn sau 1 giờ
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
