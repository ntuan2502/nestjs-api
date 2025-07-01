import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetTransactionDto } from './dto/create-asset-transaction.dto';
import { UpdateAssetTransactionDto } from './dto/update-asset-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseFilter } from 'src/common/utils/parseFilter';
import { normalizePath } from 'src/common/utils/function';
import * as fs from 'fs';
import {
  Prisma,
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class AssetTransactionsService {
  constructor(private prisma: PrismaService) {}

  private async findActiveOrFail(id: string) {
    const data = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`assetTransaction with id ${id} not found`);
    }

    return data;
  }

  async create(
    req: AuthRequest,
    createAssetTransactionDto: CreateAssetTransactionDto,
  ) {
    const data = { ...createAssetTransactionDto };

    const assetTransaction = await this.prisma.assetTransaction.create({
      data: {
        ...data,
        direction: TransactionDirection.INCOMING,
        status: TransactionStatus.COMPLETED,

        createdById: req.user.sub,
      },
    });

    return {
      message: 'Asset transaction created successfully',
      assetTransaction,
    };
  }

  async findAll(isDeleted: boolean = false, filter?: string | string[]) {
    const whereClause = isDeleted ? undefined : { deletedAt: null };
    const filterWhere = parseFilter(filter);
    const assetTransactions = await this.prisma.assetTransaction.findMany({
      where: { ...whereClause, ...filterWhere },
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
        office: { select: { id: true, name: true, shortName: true } },
        department: { select: { id: true, name: true } },
        asset: {
          include: {
            deviceModel: true,
            deviceType: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Asset transaction fetched successfully',
      assetTransactions,
    };
  }

  async findOne(id: string, isDeleted: boolean = false) {
    const whereClause: Prisma.AssetTransactionWhereInput = { id };

    if (!isDeleted) {
      whereClause.deletedAt = null;
    }

    const assetTransaction = await this.prisma.assetTransaction.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
        office: { select: { id: true, name: true, shortName: true } },
        department: { select: { id: true, name: true } },
        asset: {
          include: {
            deviceModel: true,
            deviceType: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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
    req: AuthRequest,
    id: string,
    updateAssetTransactionDto: UpdateAssetTransactionDto,
  ) {
    await this.findActiveOrFail(id);

    const { ...rest } = updateAssetTransactionDto;

    const updatedAssetTransaction = await this.prisma.assetTransaction.update({
      where: { id },
      data: {
        ...rest,
      },
    });

    return {
      message: 'Asset transaction updated successfully',
      assetTransaction: updatedAssetTransaction,
    };
  }

  async remove(req: AuthRequest, id: string) {
    await this.findActiveOrFail(id);

    await this.prisma.assetTransaction.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: req.user.sub },
    });

    return {
      message: 'Asset transaction deleted successfully',
    };
  }

  async createRequest(
    req: AuthRequest,
    createAssetTransactionDto: CreateAssetTransactionDto,
    signature: Express.Multer.File,
  ) {
    const {
      assetId,
      fromUserId,
      toUserId,
      departmentId,
      officeId,
      note,
      type,
      relatedAssets,
    } = createAssetTransactionDto;

    try {
      const asset = await this.findActiveOrFail(assetId);

      const fromUser = await this.prisma.user.findFirst({
        where: { id: fromUserId, deletedAt: null },
      });

      if (!fromUser) {
        throw new NotFoundException(`User with id ${fromUserId} not found`);
      }

      const toUser = await this.prisma.user.findFirst({
        where: { id: toUserId, deletedAt: null },
      });

      if (!toUser) {
        throw new NotFoundException(`User with id ${toUserId} not found`);
      }

      const department = await this.prisma.department.findFirst({
        where: { id: departmentId, deletedAt: null },
      });

      if (!department) {
        throw new NotFoundException(
          `Department with id ${departmentId} not found`,
        );
      }

      const office = await this.prisma.office.findFirst({
        where: { id: officeId, deletedAt: null },
      });

      if (!office) {
        throw new NotFoundException(`Office with id ${officeId} not found`);
      }

      if (type === TransactionType.TRANSFER) {
        const transaction = await this.prisma.assetTransaction.findFirst({
          where: {
            assetId: asset.id,
            userId: toUser.id,
            departmentId: department.id,
            officeId: office.id,
            type: TransactionType.TRANSFER,
            direction: TransactionDirection.INCOMING,
            status: TransactionStatus.PENDING,
          },
          include: { asset: true },
        });

        if (transaction) {
          throw new BadRequestException(
            `You already have a pending transaction for ${transaction.asset?.internalCode}`,
          );
        }

        const handoverFromTransaction =
          await this.prisma.assetTransaction.findFirst({
            where: {
              assetId: asset.id,
              departmentId: department.id,
              officeId: office.id,
              type: TransactionType.TRANSFER,
              direction: TransactionDirection.OUTGOING,
              status: TransactionStatus.COMPLETED,
            },
            include: { user: true, asset: true },
            orderBy: { createdAt: 'desc' },
          });

        const handoverToTransaction =
          await this.prisma.assetTransaction.findFirst({
            where: {
              assetId: asset.id,
              departmentId: department.id,
              officeId: office.id,
              type: TransactionType.TRANSFER,
              direction: TransactionDirection.INCOMING,
              status: TransactionStatus.COMPLETED,
            },
            include: { user: true, asset: true },
            orderBy: { createdAt: 'desc' },
          });

        if (handoverFromTransaction && handoverToTransaction) {
          throw new BadRequestException(
            `Asset ${handoverFromTransaction.asset?.internalCode} already handed over from ${handoverFromTransaction.user?.name} to ${handoverToTransaction.user?.name}`,
          );
        }

        if (relatedAssets && relatedAssets.length > 0) {
          for (let i = 0; i < relatedAssets.length; i++) {
            const relatedAssetId = relatedAssets[i];
            const relatedAsset = await this.findActiveOrFail(relatedAssetId);

            const relatedAssetTransaction =
              await this.prisma.assetTransaction.findFirst({
                where: {
                  assetId: relatedAsset.id,
                  type: TransactionType.TRANSFER,
                  direction: TransactionDirection.INCOMING,
                  status: TransactionStatus.PENDING,
                },
                include: { asset: true },
              });

            if (relatedAssetTransaction) {
              throw new BadRequestException(
                `You already have a pending transaction for ${relatedAssetTransaction.asset?.internalCode}`,
              );
            }
          }
        }

        const signatureFile = await this.prisma.file.create({
          data: {
            filePath: normalizePath(signature.path),
            createdById: req.user.sub,
          },
        });

        const assetTransferBatch = await this.prisma.assetTransferBatch.create({
          data: {
            note,
            createdById: req.user.sub,
          },
        });

        const assetTransaction = await this.prisma.assetTransaction.create({
          data: {
            assetTransferBatchId: assetTransferBatch.id,
            assetId: asset.id,
            userId: fromUser.id,
            departmentId: department.id,
            officeId: office.id,
            signatureId: signatureFile.id,
            signedAt: new Date(),
            type: TransactionType.TRANSFER,
            direction: TransactionDirection.OUTGOING,
            status: TransactionStatus.COMPLETED,
            createdById: req.user.sub,
          },
        });

        const confirmedAssetTransaction =
          await this.prisma.assetTransaction.create({
            data: {
              assetTransferBatchId: assetTransferBatch.id,
              assetId: asset.id,
              userId: toUser.id,
              departmentId: department.id,
              officeId: office.id,
              type: TransactionType.TRANSFER,
              direction: TransactionDirection.INCOMING,
              status: TransactionStatus.PENDING,
              createdById: req.user.sub,
            },
          });

        if (relatedAssets && relatedAssets.length > 0) {
          for (const relatedAssetId of relatedAssets) {
            await this.prisma.assetTransaction.create({
              data: {
                assetTransferBatchId: assetTransferBatch.id,
                assetId: relatedAssetId,
                userId: fromUser.id,
                departmentId: department.id,
                officeId: office.id,
                signatureId: signatureFile.id,
                signedAt: new Date(),
                type: TransactionType.TRANSFER,
                direction: TransactionDirection.OUTGOING,
                status: TransactionStatus.COMPLETED,
                createdById: req.user.sub,
              },
            });

            await this.prisma.assetTransaction.create({
              data: {
                assetTransferBatchId: assetTransferBatch.id,
                assetId: relatedAssetId,
                userId: toUser.id,
                departmentId: department.id,
                officeId: office.id,
                type: TransactionType.TRANSFER,
                direction: TransactionDirection.INCOMING,
                status: TransactionStatus.PENDING,
                createdById: req.user.sub,
              },
            });
          }
        }

        return {
          message: 'Asset transaction created successfully',
          assetTransaction,
          confirmedAssetTransaction,
        };
      } else {
        throw new BadRequestException('Invalid transaction type');
      }
    } catch (error) {
      if (signature?.path) {
        try {
          fs.unlinkSync(signature.path);
        } catch (unlinkErr) {
          console.warn(
            `Failed to delete temp file: ${signature.path}`,
            unlinkErr,
          );
        }
      }
      throw error;
    }
  }
}
