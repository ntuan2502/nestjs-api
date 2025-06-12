import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class OfficesService {
  constructor(private prisma: PrismaService) {}

  private async findActiveOrFail(id: string) {
    const data = await this.prisma.office.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`office with id ${id} not found`);
    }

    return data;
  }

  private async validateUnique(taxCode: string, exclude?: string) {
    const data = await this.prisma.office.findFirst({
      where: {
        taxCode,
        deletedAt: null,
        ...(exclude ? { NOT: { id: exclude } } : {}),
      },
    });

    if (data) {
      throw new BadRequestException(
        `office with taxCode ${taxCode} already exists`,
      );
    }
  }

  async create(req: AuthRequest, createOfficeDto: CreateOfficeDto) {
    const { taxCode } = createOfficeDto;
    await this.validateUnique(taxCode);

    const office = await this.prisma.office.create({
      data: { ...createOfficeDto, createdById: req.user.sub },
    });

    return {
      message: 'Office created successfully',
      office,
    };
  }

  async findAll(isDeleted: boolean = false) {
    const whereClause = isDeleted ? undefined : { deletedAt: null };

    const offices = await this.prisma.office.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Offices fetched successfully',
      offices,
    };
  }

  async findOne(id: string, isDeleted: boolean = false) {
    const whereClause: Prisma.OfficeWhereInput = { id };

    if (!isDeleted) {
      whereClause.deletedAt = null;
    }
    const office = await this.prisma.office.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!office) {
      throw new NotFoundException(`Office with id ${id} not found`);
    }

    return {
      message: 'Office fetched successfully',
      office,
    };
  }

  async update(req: AuthRequest, id: string, updateOfficeDto: UpdateOfficeDto) {
    await this.findActiveOrFail(id);

    const { taxCode } = updateOfficeDto;
    if (taxCode) {
      await this.validateUnique(taxCode, id);
    }

    const updateOffice = await this.prisma.office.update({
      where: { id },
      data: { ...updateOfficeDto, updatedById: req.user.sub },
    });
    return {
      message: 'Office updated successfully',
      office: updateOffice,
    };
  }

  async remove(req: AuthRequest, id: string) {
    await this.findActiveOrFail(id);

    await this.prisma.office.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: req.user.sub },
    });

    return {
      message: 'Office deleted successfully',
    };
  }
}
