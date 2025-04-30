import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BankAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(createBankAccountDto: CreateBankAccountDto) {
    const { accountName, accountNumber } = createBankAccountDto;
    const existingBank = await this.prisma.bankAccount.findFirst({
      where: { accountName, accountNumber, deletedAt: null },
    });

    if (existingBank) {
      throw new BadRequestException(
        `Bank account with name ${accountName} and account number ${accountNumber} already exists`,
      );
    }

    const bankAccount = await this.prisma.bankAccount.create({
      data: createBankAccountDto,
    });

    return {
      message: 'Bank account created successfully',
      bankAccount,
    };
  }

  async findAll() {
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: { deletedAt: null },
      include: { supplier: true, bank: true },
    });

    return {
      message: 'Bank account fetched successfully',
      bankAccounts,
    };
  }

  async findOne(id: number) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: null },
      include: { supplier: true, bank: true },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    return {
      message: 'Bank account fetched successfully',
      bankAccount,
    };
  }

  async update(id: number, updateBankAccountDto: UpdateBankAccountDto) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: null },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    const updatedBank = await this.prisma.bankAccount.update({
      where: { id },
      data: updateBankAccountDto,
      include: { supplier: true, bank: true },
    });

    return {
      message: 'Bank account updated successfully',
      bank: updatedBank,
    };
  }

  async remove(id: number) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: null },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    await this.prisma.bankAccount.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Bank account removed successfully',
    };
  }
}
