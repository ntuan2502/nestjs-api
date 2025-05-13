import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetTransactionDto } from './dto/create-asset-transaction.dto';
import { UpdateAssetTransactionDto } from './dto/update-asset-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseInclude } from 'src/common/utils/parseInclude';
import { parseFilter } from 'src/common/utils/parseFilter';
import { saveBase64File } from 'src/common/utils/saveBase64File';

@Injectable()
export class AssetTransactionsService {
  constructor(private prisma: PrismaService) {}
  async create(createAssetTransactionDto: CreateAssetTransactionDto) {
    const data = { ...createAssetTransactionDto };

    if (data.fromSignature) {
      data.fromSignature = saveBase64File(data.fromSignature, 'signatures');
    }

    if (data.toSignature) {
      data.toSignature = saveBase64File(data.toSignature, 'signatures');
    }

    const assetTransaction = await this.prisma.assetTransaction.create({
      data,
    });

    return {
      message: 'Asset transaction created successfully',
      assetTransaction,
    };
  }

  async findAll(includeParam?: string | string[], filter?: string | string[]) {
    const include = parseInclude(includeParam);
    const filterWhere = parseFilter(filter);
    const assetTransactions = await this.prisma.assetTransaction.findMany({
      where: { deletedAt: null, ...filterWhere },
      include,
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Asset transactions fetched successfully',
      assetTransactions,
    };
  }

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const assetTransaction = await this.prisma.assetTransaction.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!assetTransaction) {
      throw new NotFoundException(`Asset transaction with id ${id} not found`);
    }

    return {
      message: 'Asset transaction fetched successfully',
      assetTransaction,
    };
  }

  async update(
    id: string,
    updateAssetTransactionDto: UpdateAssetTransactionDto,
    fromSignature?: Express.Multer.File,
    toSignature?: Express.Multer.File,
  ) {
    const assetTransaction = await this.prisma.assetTransaction.findFirst({
      where: { id, deletedAt: null },
    });

    if (!assetTransaction) {
      throw new NotFoundException(`Asset transaction with id ${id} not found`);
    }

    const { ...rest } = updateAssetTransactionDto;

    const normalizePath = (path: string) => path.replace(/\\/g, '/');

    const updatedAssetTransaction = await this.prisma.assetTransaction.update({
      where: { id },
      data: {
        ...rest,
        fromSignature: fromSignature
          ? normalizePath(fromSignature.path)
          : undefined,
        toSignature: toSignature ? normalizePath(toSignature.path) : undefined,
        fromSignedAt: new Date(),
        toSignedAt: new Date(),
      },
    });

    return {
      message: 'Asset transaction updated successfully',
      assetTransaction: updatedAssetTransaction,
    };
  }

  async remove(id: string) {
    const assetTransaction = await this.prisma.assetTransaction.findFirst({
      where: { id, deletedAt: null },
    });

    if (!assetTransaction) {
      throw new NotFoundException(`Asset transaction with id ${id} not found`);
    }

    await this.prisma.assetTransaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Asset transaction deleted successfully',
    };
  }
}
