import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeviceModelDto } from './dto/create-device-model.dto';
import { UpdateDeviceModelDto } from './dto/update-device-model.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class DeviceModelsService {
  constructor(private prisma: PrismaService) {}

  private async findActiveOrFail(id: string) {
    const data = await this.prisma.deviceModel.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`deviceModel with id ${id} not found`);
    }

    return data;
  }

  private async validateUnique(name: string, exclude?: string) {
    const data = await this.prisma.deviceModel.findFirst({
      where: {
        name,
        deletedAt: null,
        ...(exclude ? { NOT: { id: exclude } } : {}),
      },
    });

    if (data) {
      throw new BadRequestException(
        `deviceModel with name ${name} already exists`,
      );
    }
  }

  async create(req: AuthRequest, createDeviceModelDto: CreateDeviceModelDto) {
    const { name } = createDeviceModelDto;
    await this.validateUnique(name);

    const deviceModel = await this.prisma.deviceModel.create({
      data: { ...createDeviceModelDto, createdById: req.user.sub },
    });

    return {
      message: 'DeviceModel created successfully',
      deviceModel,
    };
  }

  async findAll(isDeleted: boolean = false) {
    const whereClause = isDeleted ? undefined : { deletedAt: null };
    const deviceModels = await this.prisma.deviceModel.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'DeviceModels fetched successfully',
      deviceModels,
    };
  }

  async findOne(id: string, isDeleted: boolean = false) {
    const whereClause: Prisma.DeviceModelWhereInput = { id };
    if (!isDeleted) {
      whereClause.deletedAt = null;
    }
    const deviceModel = await this.prisma.deviceModel.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!deviceModel) {
      throw new NotFoundException(`DeviceModel with id ${id} not found`);
    }

    return {
      message: 'DeviceModel fetched successfully',
      deviceModel,
    };
  }

  async update(
    req: AuthRequest,
    id: string,
    updateDeviceModelDto: UpdateDeviceModelDto,
  ) {
    await this.findActiveOrFail(id);

    const { name } = updateDeviceModelDto;
    if (name) {
      await this.validateUnique(name, id);
    }

    const updatedDeviceModel = await this.prisma.deviceModel.update({
      where: { id },
      data: { ...updateDeviceModelDto, updatedById: req.user.sub },
    });

    return {
      message: 'DeviceModel updated successfully',
      deviceModel: updatedDeviceModel,
    };
  }

  async remove(req: AuthRequest, id: string) {
    await this.findActiveOrFail(id);

    await this.prisma.deviceModel.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: req.user.sub },
    });

    return {
      message: 'DeviceModel removed successfully',
    };
  }
}
