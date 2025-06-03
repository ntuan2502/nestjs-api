import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseInclude } from 'src/common/utils/parseInclude';
import { parseFilter } from 'src/common/utils/parseFilter';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(req: AuthRequest, createAssetDto: CreateAssetDto) {
    const { internalCode } = createAssetDto;
    const existingAsset = await this.prisma.asset.findFirst({
      where: { internalCode, deletedAt: null },
    });

    if (existingAsset) {
      throw new BadRequestException(
        `Asset with internal code ${internalCode} already exists`,
      );
    }

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

  async findAll(includeParam?: string | string[], filter?: string | string[]) {
    // const include = parseInclude(includeParam);
    const filterWhere = parseFilter(filter);
    const assets = await this.prisma.asset.findMany({
      where: { deletedAt: null, ...filterWhere },
      // include,
      include: {
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

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const asset = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }

    return {
      message: 'Asset fetched successfully',
      asset,
    };
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }

    const { internalCode } = updateAssetDto;
    if (internalCode !== asset.internalCode) {
      const existingAsset = await this.prisma.asset.findFirst({
        where: { internalCode, deletedAt: null },
      });
      if (existingAsset) {
        throw new BadRequestException(
          `Asset with internalCode ${internalCode} already exists`,
        );
      }
    }

    const updatedAsset = await this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });

    return {
      message: 'Asset updated successfully',
      asset: updatedAsset,
    };
  }

  async remove(id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }

    await this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Asset deleted successfully',
    };
  }
}
