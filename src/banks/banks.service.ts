import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseInclude } from 'src/common/utils/parseInclude';

@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}

  async create(createBankDto: CreateBankDto) {
    const { shortName } = createBankDto;
    const existingBank = await this.prisma.bank.findFirst({
      where: { shortName, deletedAt: null },
    });

    if (existingBank) {
      throw new BadRequestException(
        `Bank with name ${shortName} already exists`,
      );
    }

    const bank = await this.prisma.bank.create({
      data: createBankDto,
    });

    return {
      message: 'Bank created successfully',
      bank,
    };
  }

  async findAll(includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const banks = await this.prisma.bank.findMany({
      where: { deletedAt: null },
      include,
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Banks fetched successfully',
      banks,
    };
  }

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const bank = await this.prisma.bank.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!bank) {
      throw new NotFoundException(`Bank with id ${id} not found`);
    }

    return {
      message: 'Bank fetched successfully',
      bank,
    };
  }

  async update(id: string, updateBankDto: UpdateBankDto) {
    const bank = await this.prisma.bank.findFirst({
      where: { id, deletedAt: null },
    });

    if (!bank) {
      throw new BadRequestException(`Bank with id ${id} already exists`);
    }

    const { shortName } = updateBankDto;
    if (shortName != bank.shortName) {
      const existingBank = await this.prisma.bank.findFirst({
        where: {
          shortName,
          deletedAt: null,
        },
      });

      if (existingBank) {
        throw new BadRequestException(
          `Device type with shortName ${shortName} already exists`,
        );
      }
    }

    const updatedBank = await this.prisma.bank.update({
      where: { id },
      data: updateBankDto,
    });

    return {
      message: 'Bank updated successfully',
      bank: updatedBank,
    };
  }

  async remove(id: string) {
    const bank = await this.prisma.bank.findFirst({
      where: { id, deletedAt: null },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with id ${id} not found`);
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
