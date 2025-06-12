import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}

  private async findActiveOrFail(id: string) {
    const data = await this.prisma.bank.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`bank with id ${id} not found`);
    }

    return data;
  }

  private async validateUnique(shortName: string, exclude?: string) {
    const data = await this.prisma.bank.findFirst({
      where: {
        shortName,
        deletedAt: null,
        ...(exclude ? { NOT: { id: exclude } } : {}),
      },
    });

    if (data) {
      throw new BadRequestException(
        `bank with shortName ${shortName} already exists`,
      );
    }
  }

  async create(req: AuthRequest, createBankDto: CreateBankDto) {
    const { shortName } = createBankDto;
    await this.validateUnique(shortName);

    const bank = await this.prisma.bank.create({
      data: { ...createBankDto, createdById: req.user.sub },
    });

    return {
      message: 'Bank created successfully',
      bank,
    };
  }

  async findAll(isDeleted: boolean = false) {
    const whereClause = isDeleted ? undefined : { deletedAt: null };
    const banks = await this.prisma.bank.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Banks fetched successfully',
      banks,
    };
  }

  async findOne(id: string, isDeleted: boolean = false) {
    const whereClause: Prisma.BankWhereInput = { id };
    if (!isDeleted) {
      whereClause.deletedAt = null;
    }
    const bank = await this.prisma.bank.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with id ${id} not found`);
    }

    return {
      message: 'Bank fetched successfully',
      bank,
    };
  }

  async update(req: AuthRequest, id: string, updateBankDto: UpdateBankDto) {
    await this.findActiveOrFail(id);

    const { shortName } = updateBankDto;
    if (shortName) {
      await this.validateUnique(shortName, id);
    }

    const updatedBank = await this.prisma.bank.update({
      where: { id },
      data: { ...updateBankDto, updatedById: req.user.sub },
    });

    return {
      message: 'Bank updated successfully',
      bank: updatedBank,
    };
  }

  async remove(req: AuthRequest, id: string) {
    await this.findActiveOrFail(id);

    await this.prisma.bank.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: req.user.sub },
    });

    return {
      message: 'Bank deleted successfully',
    };
  }
}
