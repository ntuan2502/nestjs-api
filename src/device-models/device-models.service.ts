import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeviceModelDto } from './dto/create-device-model.dto';
import { UpdateDeviceModelDto } from './dto/update-device-model.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseInclude } from 'src/common/utils/parseInclude';

@Injectable()
export class DeviceModelsService {
  constructor(private prisma: PrismaService) {}

  async create(createDeviceModelDto: CreateDeviceModelDto) {
    const { name } = createDeviceModelDto;
    const existingDeviceModel = await this.prisma.deviceModel.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existingDeviceModel) {
      throw new BadRequestException(
        `Device model with name ${name} already exists`,
      );
    }

    const deviceModel = await this.prisma.deviceModel.create({
      data: createDeviceModelDto,
    });

    return {
      message: 'DeviceModel created successfully',
      deviceModel,
    };
  }

  async findAll(includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const deviceModels = await this.prisma.deviceModel.findMany({
      where: { deletedAt: null },
      include,
      orderBy: { name: 'asc' },
    });

    return {
      message: 'DeviceModels fetched successfully',
      deviceModels,
    };
  }

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const deviceModel = await this.prisma.deviceModel.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!deviceModel) {
      throw new NotFoundException(`DeviceModel with id ${id} not found`);
    }

    return {
      message: 'DeviceModel fetched successfully',
      deviceModel,
    };
  }

  async update(id: string, updateDeviceModelDto: UpdateDeviceModelDto) {
    const deviceModel = await this.prisma.deviceModel.findFirst({
      where: { id, deletedAt: null },
    });

    if (!deviceModel) {
      throw new NotFoundException(`DeviceModel with id ${id} not found`);
    }

    const { name } = updateDeviceModelDto;
    const existingDeviceModel = await this.prisma.deviceModel.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
    if (existingDeviceModel) {
      throw new BadRequestException(
        `Device model with name ${name} already exists`,
      );
    }

    const updatedDeviceModel = await this.prisma.deviceModel.update({
      where: { id },
      data: updateDeviceModelDto,
    });

    return {
      message: 'DeviceModel updated successfully',
      deviceModel: updatedDeviceModel,
    };
  }

  async remove(id: string) {
    const deviceModel = await this.prisma.deviceModel.findFirst({
      where: { id, deletedAt: null },
    });

    if (!deviceModel) {
      throw new NotFoundException(`DeviceModel with id ${id} not found`);
    }

    await this.prisma.deviceModel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'DeviceModel removed successfully',
    };
  }
}
