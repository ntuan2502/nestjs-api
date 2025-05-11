import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseInclude } from 'src/common/utils/parseInclude';
import { parseFilter } from 'src/common/utils/parseFilter';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto) {
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
      data: createAssetDto,
    });

    return {
      message: 'Asset created successfully',
      asset,
    };
  }

  async findAll(includeParam?: string | string[], filter?: string | string[]) {
    const include = parseInclude(includeParam);
    const filterWhere = parseFilter(filter);
    const assets = await this.prisma.asset.findMany({
      where: { deletedAt: null, ...filterWhere },
      include,
      orderBy: { internalCode: 'asc' },
    });

    return {
      message: 'Assets fetched successfully',
      assets,
    };
  }

  async findOne(id: number, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const asset = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!asset) {
      throw new BadRequestException(`Asset with ID ${id} not found`);
    }

    return {
      message: 'Asset fetched successfully',
      asset,
    };
  }

  async update(id: number, updateAssetDto: UpdateAssetDto) {
    const { internalCode } = updateAssetDto;
    const existingAsset = await this.prisma.asset.findFirst({
      where: { internalCode, deletedAt: null },
    });

    if (existingAsset?.internalCode !== internalCode) {
      throw new BadRequestException(
        `Asset with internal code ${internalCode} already exists`,
      );
    }

    const asset = await this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
    });

    return {
      message: 'Asset updated successfully',
      asset,
    };
  }

  async remove(id: number) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      throw new BadRequestException(`Asset with ID ${id} not found`);
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
