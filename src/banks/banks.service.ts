import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}

  async create(createBankDto: CreateBankDto) {
    const { name } = createBankDto;
    const existingBank = await this.prisma.bank.findFirst({
      where: { name, deletedAt: null },
    });

    if (existingBank) {
      throw new BadRequestException(`Bank with name ${name} already exists`);
    }

    const bank = await this.prisma.bank.create({
      data: createBankDto,
    });

    return {
      message: 'Bank created successfully',
      bank,
    };
  }

  async findAll() {
    const banks = await this.prisma.bank.findMany({
      where: { deletedAt: null },
      include: { bankAccounts: true },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Banks fetched successfully',
      banks,
    };
  }

  async findOne(id: number) {
    const bank = await this.prisma.bank.findFirst({
      where: { id, deletedAt: null },
      include: { bankAccounts: true },
    });

    if (!bank) {
      throw new BadRequestException(`Bank with ID ${id} not found`);
    }

    return {
      message: 'Bank fetched successfully',
      bank,
    };
  }

  async update(id: number, updateBankDto: UpdateBankDto) {
    const { name } = updateBankDto;
    const existingBank = await this.prisma.bank.findFirst({
      where: { name, deletedAt: null },
    });

    if (existingBank) {
      throw new BadRequestException(`Bank with name ${name} already exists`);
    }

    const bank = await this.prisma.bank.update({
      where: { id },
      data: updateBankDto,
    });

    return {
      message: 'Bank updated successfully',
      bank,
    };
  }

  async remove(id: number) {
    const bank = await this.prisma.bank.findFirst({
      where: { id, deletedAt: null },
    });

    if (!bank) {
      throw new BadRequestException(`Bank with ID ${id} not found`);
    }

    await this.prisma.bank.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Bank deleted successfully',
    };
  }
}
