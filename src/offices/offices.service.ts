import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { parseInclude } from 'src/common/utils/parseInclude';

@Injectable()
export class OfficesService {
  constructor(private prisma: PrismaService) {}

  async create(createOfficeDto: CreateOfficeDto) {
    const { taxCode } = createOfficeDto;
    const existingOffice = await this.prisma.office.findFirst({
      where: { taxCode, deletedAt: null },
    });

    if (existingOffice) {
      throw new BadRequestException(
        `Office with taxCode ${taxCode} already exists`,
      );
    }

    const office = await this.prisma.office.create({
      data: createOfficeDto,
    });

    return {
      message: 'Office created successfully',
      office,
    };
  }

  async findAll(includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const offices = await this.prisma.office.findMany({
      where: { deletedAt: null },
      include,
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Offices fetched successfully',
      offices,
    };
  }

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const office = await this.prisma.office.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!office) {
      throw new NotFoundException(`Office with id ${id} not found`);
    }

    return {
      message: 'Office fetched successfully',
      office,
    };
  }

  async update(id: string, updateOfficeDto: UpdateOfficeDto) {
    const office = await this.prisma.office.findFirst({
      where: { id, deletedAt: null },
    });

    if (!office) {
      throw new NotFoundException(`Office with id ${id} not found`);
    }

    const { taxCode } = updateOfficeDto;

    if (taxCode !== office.taxCode) {
      const existingOffice = await this.prisma.office.findFirst({
        where: { taxCode, deletedAt: null },
      });
      if (existingOffice) {
        throw new BadRequestException(
          `Office with taxCode ${taxCode} already exists`,
        );
      }
    }

    const updateOffice = await this.prisma.office.update({
      where: { id },
      data: updateOfficeDto,
    });
    return {
      message: 'Office updated successfully',
      office: updateOffice,
    };
  }

  async remove(id: string) {
    const office = await this.prisma.office.findFirst({
      where: { id, deletedAt: null },
    });

    if (!office) {
      throw new NotFoundException(`Office with id ${id} not found`);
    }

    await this.prisma.office.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Office deleted successfully',
    };
  }
}
