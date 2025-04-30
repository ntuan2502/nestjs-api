import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { OfficesModule } from './offices/offices.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { DepartmentsModule } from './departments/departments.module';
import { DeviceTypesModule } from './device-types/device-types.module';
import { DeviceModelsModule } from './device-models/device-models.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { BanksModule } from './banks/banks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Làm ConfigModule toàn cục, không cần import lại ở module khác
    }),
    PrismaModule,
    UsersModule,
    OfficesModule,
    AuthModule,
    DepartmentsModule,
    DeviceTypesModule,
    DeviceModelsModule,
    BankAccountsModule,
    SuppliersModule,
    BanksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD, // Đăng ký JwtAuthGuard như một guard toàn cục
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
