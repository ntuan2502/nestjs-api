import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';

@Injectable()
export class OfficesService {
  constructor(private prisma: PrismaService) {}

  create(createOfficeDto: CreateOfficeDto) {
    return this.prisma.office.create({
      data: createOfficeDto,
    });
  }

  findAll() {
    return this.prisma.office.findMany({
      where: { deletedAt: null },
      include: { users: true },
    });
  }

  async findOne(id: number) {
    const office = await this.prisma.office.findUnique({
      where: { id, deletedAt: null },
      include: { users: true },
    });
    if (!office) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }
    return office;
  }

  async update(id: number, updateOfficeDto: UpdateOfficeDto) {
    const office = await this.prisma.office.findUnique({
      where: { id, deletedAt: null },
    });
    if (!office) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }
    return this.prisma.office.update({
      where: { id },
      data: updateOfficeDto,
    });
  }

  async remove(id: number) {
    const office = await this.prisma.office.findUnique({
      where: { id, deletedAt: null },
    });
    if (!office) {
      throw new NotFoundException(`Office with ID ${id} not found`);
    }
    return this.prisma.office.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
