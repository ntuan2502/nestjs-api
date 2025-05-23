import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DeviceModelsService } from './device-models.service';
import { CreateDeviceModelDto } from './dto/create-device-model.dto';
import { UpdateDeviceModelDto } from './dto/update-device-model.dto';

@Controller('device-models')
export class DeviceModelsController {
  constructor(private readonly deviceModelsService: DeviceModelsService) {}

  @Post()
  create(@Body() createDeviceModelDto: CreateDeviceModelDto) {
    return this.deviceModelsService.create(createDeviceModelDto);
  }

  @Get()
  findAll(@Query('include') includeParam?: string | string[]) {
    return this.deviceModelsService.findAll(includeParam);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('include') includeParam?: string | string[],
  ) {
    return this.deviceModelsService.findOne(id, includeParam);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeviceModelDto: UpdateDeviceModelDto,
  ) {
    return this.deviceModelsService.update(id, updateDeviceModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceModelsService.remove(id);
  }
}
