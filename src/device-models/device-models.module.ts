import { Module } from '@nestjs/common';
import { DeviceModelsService } from './device-models.service';
import { DeviceModelsController } from './device-models.controller';

@Module({
  controllers: [DeviceModelsController],
  providers: [DeviceModelsService],
})
export class DeviceModelsModule {}
