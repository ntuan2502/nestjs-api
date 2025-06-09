import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseFilter } from 'src/common/utils/parseFilter';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  private async findActiveOrFail(id: string) {
    const data = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`asset with id ${id} not found`);
    }

    return data;
  }

  private async validateUnique(internalCode: string, exclude?: string) {
    const data = await this.prisma.asset.findFirst({
      where: {
        internalCode,
        deletedAt: null,
        ...(exclude ? { NOT: { id: exclude } } : {}),
      },
    });

    if (data) {
      throw new BadRequestException(
        `asset with internalCode ${internalCode} already exists`,
      );
    }
  }

  async create(req: AuthRequest, createAssetDto: CreateAssetDto) {
    const { internalCode } = createAssetDto;
    await this.validateUnique(internalCode);

    const asset = await this.prisma.asset.create({
      data: {
        ...createAssetDto,
        createdById: req.user.sub,
      },
    });

    return {
      message: 'Asset created successfully',
      asset,
    };
  }

  async findAll(isDeleted: boolean = false, filter?: string | string[]) {
    const whereClause = isDeleted ? undefined : { deletedAt: null };
    const filterWhere = parseFilter(filter);
    const assets = await this.prisma.asset.findMany({
      where: { ...whereClause, ...filterWhere },
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
        deviceType: true,
        deviceModel: true,
        assetTransactions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              include: {
                office: true,
                department: true,
              },
            },
          },
        },
      },
      orderBy: { internalCode: 'asc' },
    });

    return {
      message: 'Assets fetched successfully',
      assets,
    };
  }

  async findOne(id: string, isDeleted: boolean = false) {
    const whereClause: Prisma.AssetWhereInput = { id };

    if (!isDeleted) {
      whereClause.deletedAt = null;
    }
    const asset = await this.prisma.asset.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
        deviceType: true,
        deviceModel: true,
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }

    return {
      message: 'Asset fetched successfully',
      asset,
    };
  }

  async update(req: AuthRequest, id: string, updateAssetDto: UpdateAssetDto) {
    await this.findActiveOrFail(id);

    const { internalCode, warranty, ...rest } = updateAssetDto;
    if (internalCode) {
      await this.validateUnique(internalCode, id);
    }

    const updatedAsset = await this.prisma.asset.update({
      where: { id },
      data: {
        ...rest,
        ...(internalCode ? { internalCode } : {}),
        warranty: warranty ? Number(warranty) : undefined,
        updatedById: req.user.sub,
      },
    });

    return {
      message: 'Asset updated successfully',
      asset: updatedAsset,
    };
  }

  async remove(req: AuthRequest, id: string) {
    await this.findActiveOrFail(id);

    await this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: req.user.sub },
    });

    return {
      message: 'Asset deleted successfully',
    };
  }
}
