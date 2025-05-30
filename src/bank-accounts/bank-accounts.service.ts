import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseInclude } from 'src/common/utils/parseInclude';

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

  async findAll(includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: { deletedAt: null },
      include,
      orderBy: { accountName: 'asc' },
    });

    return {
      message: 'Bank account fetched successfully',
      bankAccounts,
    };
  }

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with id ${id} not found`);
    }

    return {
      message: 'Bank account fetched successfully',
      bankAccount,
    };
  }

  async update(id: string, updateBankAccountDto: UpdateBankAccountDto) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: null },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with id ${id} not found`);
    }

    const { accountName, accountNumber } = updateBankAccountDto;
    if (
      accountName !== bankAccount.accountName &&
      accountNumber !== bankAccount.accountNumber
    ) {
      const existingBank = await this.prisma.bankAccount.findFirst({
        where: {
          accountName,
          accountNumber,
          deletedAt: null,
        },
      });

      if (existingBank) {
        throw new BadRequestException(
          `Bank account with name ${accountName} and account number ${accountNumber} already exists`,
        );
      }
    }

    const updatedBank = await this.prisma.bankAccount.update({
      where: { id },
      data: updateBankAccountDto,
    });

    return {
      message: 'Bank account updated successfully',
      bank: updatedBank,
    };
  }

  async remove(id: string) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, deletedAt: null },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with id ${id} not found`);
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
