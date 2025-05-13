import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeviceTypeDto } from './dto/create-device-type.dto';
import { UpdateDeviceTypeDto } from './dto/update-device-type.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseInclude } from 'src/common/utils/parseInclude';

@Injectable()
export class DeviceTypesService {
  constructor(private prisma: PrismaService) {}

  async create(createDeviceTypeDto: CreateDeviceTypeDto) {
    const { name } = createDeviceTypeDto;
    const existingDeviceType = await this.prisma.deviceType.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existingDeviceType) {
      throw new BadRequestException(
        `Device type with name ${name} already exists`,
      );
    }

    const deviceType = await this.prisma.deviceType.create({
      data: createDeviceTypeDto,
    });

    return {
      message: 'DeviceType created successfully',
      deviceType,
    };
  }

  async findAll(includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const deviceTypes = await this.prisma.deviceType.findMany({
      where: { deletedAt: null },
      include,
      orderBy: { name: 'asc' },
    });

    return {
      message: 'DeviceTypes fetched successfully',
      deviceTypes,
    };
  }

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const deviceType = await this.prisma.deviceType.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!deviceType) {
      throw new NotFoundException(`DeviceType with id ${id} not found`);
    }

    return {
      message: 'DeviceType fetched successfully',
      deviceType,
    };
  }

  async update(id: string, updateDeviceTypeDto: UpdateDeviceTypeDto) {
    const deviceType = await this.prisma.deviceType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!deviceType) {
      throw new NotFoundException(`DeviceType with id ${id} not found`);
    }

    const { name } = updateDeviceTypeDto;
    if (name !== deviceType.name) {
      const existingDeviceType = await this.prisma.deviceType.findFirst({
        where: {
          name,
          deletedAt: null,
        },
      });
      if (existingDeviceType) {
        throw new BadRequestException(
          `Device type with name ${name} already exists`,
        );
      }
    }

    const updatedDeviceType = await this.prisma.deviceType.update({
      where: { id },
      data: updateDeviceTypeDto,
    });

    return {
      message: 'DeviceType updated successfully',
      deviceType: updatedDeviceType,
    };
  }

  async remove(id: string) {
    const deviceType = await this.prisma.deviceType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!deviceType) {
      throw new NotFoundException(`DeviceType with id ${id} not found`);
    }

    await this.prisma.deviceType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'DeviceType deleted successfully',
    };
  }
}
