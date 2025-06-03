import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class BankAccountsService {
  constructor(private prisma: PrismaService) {}

  private async findActiveOrFail(id: string) {
    const data = await this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`bankAccount with id ${id} not found`);
    }

    return data;
  }

  private async validateUniqueName(
    name: string,
    number: string,
    excludeId?: string,
  ) {
    const data = await this.prisma.bankAccount.findFirst({
      where: {
        name,
        number,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (data) {
      throw new BadRequestException(
        `bankAccount with name ${name} already exists`,
      );
    }
  }

  async create(req: AuthRequest, createBankAccountDto: CreateBankAccountDto) {
    const { name, number } = createBankAccountDto;
    await this.validateUniqueName(name, number);

    const bankAccount = await this.prisma.bankAccount.create({
      data: { ...createBankAccountDto, createdById: req.user.sub },
    });

    return {
      message: 'Bank account created successfully',
      bankAccount,
    };
  }

  async findAll(isDeleted: boolean = false) {
    const whereClause = isDeleted ? undefined : { deletedAt: null };
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Bank account fetched successfully',
      bankAccounts,
    };
  }

  async findOne(id: string, isDeleted: boolean = false) {
    const whereClause: Prisma.BankAccountWhereInput = { id };
    if (!isDeleted) {
      whereClause.deletedAt = null;
    }
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with id ${id} not found`);
    }

    return {
      message: 'Bank account fetched successfully',
      bankAccount,
    };
  }

  async update(
    req: AuthRequest,
    id: string,
    updateBankAccountDto: UpdateBankAccountDto,
  ) {
    await this.findActiveOrFail(id);

    const { name, number } = updateBankAccountDto;
    if (name && number) {
      await this.validateUniqueName(name, number, id);
    }

    const updatedBank = await this.prisma.bankAccount.update({
      where: { id },
      data: { ...updateBankAccountDto, updatedById: req.user.sub },
    });

    return {
      message: 'Bank account updated successfully',
      bank: updatedBank,
    };
  }

  async remove(req: AuthRequest, id: string) {
    await this.findActiveOrFail(id);

    await this.prisma.bankAccount.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: req.user.sub },
    });

    return {
      message: 'Bank account removed successfully',
    };
  }
}
