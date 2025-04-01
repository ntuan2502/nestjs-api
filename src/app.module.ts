import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { OfficesModule } from './offices/offices.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, UsersModule, OfficesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
