import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';

@Injectable()
export class OfficesService {
  constructor(private prisma: PrismaService) {}

  async create(createOfficeDto: CreateOfficeDto) {
    const createOffice = await this.prisma.office.create({
      data: createOfficeDto,
    });
    return {
      message: 'Office created successfully',
      office: createOffice,
    };
  }

  async findAll() {
    const offices = await this.prisma.office.findMany({
      where: { deletedAt: null },
      include: { users: true },
    });
    return {
      message: 'Offices fetched successfully',
      offices,
    };
  }

  async findOne(id: number) {
    const office = await this.prisma.office.findUnique({
      where: { id, deletedAt: null },
      include: { users: true },
    });
    if (!office) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }
    return {
      message: 'Office fetched successfully',
      office,
    };
  }

  async update(id: number, updateOfficeDto: UpdateOfficeDto) {
    const office = await this.prisma.office.findUnique({
      where: { id, deletedAt: null },
    });
    if (!office) {
      throw new NotFoundException(`Office with ID ${id} not found`);
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

  async remove(id: number) {
    const office = await this.prisma.office.findUnique({
      where: { id, deletedAt: null },
    });
    if (!office) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }
    const deleteOffice = await this.prisma.office.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return {
      message: 'Office deleted successfully',
      office: deleteOffice,
    };
  }
}
