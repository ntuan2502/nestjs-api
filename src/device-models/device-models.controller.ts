import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { DeviceModelsService } from './device-models.service';
import { CreateDeviceModelDto } from './dto/create-device-model.dto';
import { UpdateDeviceModelDto } from './dto/update-device-model.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('device-models')
export class DeviceModelsController {
  constructor(private readonly deviceModelsService: DeviceModelsService) {}

  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() createDeviceModelDto: CreateDeviceModelDto,
  ) {
    return this.deviceModelsService.create(req, createDeviceModelDto);
  }

  @Get()
  findAll(@Query('isDeleted') isDeleted?: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.deviceModelsService.findAll(shouldIncludeDeleted);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('isDeleted') isDeleted: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.deviceModelsService.findOne(id, shouldIncludeDeleted);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateDeviceModelDto: UpdateDeviceModelDto,
  ) {
    return this.deviceModelsService.update(req, id, updateDeviceModelDto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.deviceModelsService.remove(req, id);
  }
}
