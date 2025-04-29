import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceModelDto } from './create-device-model.dto';

export class UpdateDeviceModelDto extends PartialType(CreateDeviceModelDto) {}
