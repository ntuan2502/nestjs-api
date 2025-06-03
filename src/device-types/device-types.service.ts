import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeviceTypeDto } from './dto/create-device-type.dto';
import { UpdateDeviceTypeDto } from './dto/update-device-type.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class DeviceTypesService {
  constructor(private prisma: PrismaService) {}

  private async findActiveOrFail(id: string) {
    const data = await this.prisma.deviceType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`deviceType with id ${id} not found`);
    }

    return data;
  }

  private async validateUniqueName(name: string, excludeId?: string) {
    const data = await this.prisma.deviceType.findFirst({
      where: {
        name,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (data) {
      throw new BadRequestException(
        `deviceType with name ${name} already exists`,
      );
    }
  }

  async create(req: AuthRequest, createDeviceTypeDto: CreateDeviceTypeDto) {
    const { name } = createDeviceTypeDto;
    await this.validateUniqueName(name);

    const deviceType = await this.prisma.deviceType.create({
      data: { ...createDeviceTypeDto, createdById: req.user.sub },
    });

    return {
      message: 'DeviceType created successfully',
      deviceType,
    };
  }

  async findAll(isDeleted: boolean = false) {
    const whereClause = isDeleted ? undefined : { deletedAt: null };
    const deviceTypes = await this.prisma.deviceType.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'DeviceTypes fetched successfully',
      deviceTypes,
    };
  }

  async findOne(id: string, isDeleted: boolean = false) {
    const whereClause: Prisma.DeviceTypeWhereInput = { id };
    if (!isDeleted) {
      whereClause.deletedAt = null;
    }
    const deviceType = await this.prisma.deviceType.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!deviceType) {
      throw new NotFoundException(`DeviceType with id ${id} not found`);
    }

    return {
      message: 'DeviceType fetched successfully',
      deviceType,
    };
  }

  async update(
    req: AuthRequest,
    id: string,
    updateDeviceTypeDto: UpdateDeviceTypeDto,
  ) {
    await this.findActiveOrFail(id);

    const { name } = updateDeviceTypeDto;
    if (name) {
      await this.validateUniqueName(name, id);
    }

    const updatedDeviceType = await this.prisma.deviceType.update({
      where: { id },
      data: { ...updateDeviceTypeDto, updatedById: req.user.sub },
    });

    return {
      message: 'DeviceType updated successfully',
      deviceType: updatedDeviceType,
    };
  }

  async remove(req: AuthRequest, id: string) {
    await this.findActiveOrFail(id);

    await this.prisma.deviceType.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: req.user.sub },
    });

    return {
      message: 'DeviceType deleted successfully',
    };
  }
}
