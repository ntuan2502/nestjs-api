import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Thêm ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lấy ConfigService từ app
  const configService = app.get(ConfigService);

  // Sử dụng ValidationPipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Lắng nghe cổng từ .env hoặc mặc định 3000
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap', err);
});
