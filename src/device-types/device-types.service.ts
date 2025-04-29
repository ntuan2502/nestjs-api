import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeviceTypeDto } from './dto/create-device-type.dto';
import { UpdateDeviceTypeDto } from './dto/update-device-type.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeviceTypesService {
  constructor(private prisma: PrismaService) {}

  async create(createDeviceTypeDto: CreateDeviceTypeDto) {
    const existingDeviceType = await this.prisma.deviceType.findFirst({
      where: {
        name: createDeviceTypeDto.name,
        deletedAt: null,
      },
    });

    if (existingDeviceType) {
      throw new NotFoundException('Device type with this name already exists');
    }

    const deviceType = await this.prisma.deviceType.create({
      data: createDeviceTypeDto,
    });

    return {
      message: 'DeviceType created successfully',
      deviceType,
    };
  }

  async findAll() {
    const deviceTypes = await this.prisma.deviceType.findMany({
      where: { deletedAt: null },
      include: { deviceModels: true, assets: true },
    });

    return {
      message: 'DeviceTypes fetched successfully',
      deviceTypes,
    };
  }

  async findOne(id: number) {
    const deviceType = await this.prisma.deviceType.findFirst({
      where: { id, deletedAt: null },
      include: { deviceModels: true, assets: true },
    });

    if (!deviceType) {
      throw new NotFoundException(`DeviceType with ID ${id} not found`);
    }

    return {
      message: 'DeviceType fetched successfully',
      deviceType,
    };
  }

  async update(id: number, updateDeviceTypeDto: UpdateDeviceTypeDto) {
    const deviceType = await this.prisma.deviceType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!deviceType) {
      throw new NotFoundException(`DeviceType with ID ${id} not found`);
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

  async remove(id: number) {
    const deviceType = await this.prisma.deviceType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!deviceType) {
      throw new NotFoundException(`DeviceType with ID ${id} not found`);
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
