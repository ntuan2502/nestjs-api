import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseInclude } from 'src/common/utils/parseInclude';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    const { taxCode } = createSupplierDto;
    const existingSupplier = await this.prisma.supplier.findFirst({
      where: { taxCode, deletedAt: null },
    });

    if (existingSupplier) {
      throw new BadRequestException(
        `Supplier with tax code ${taxCode} already exists`,
      );
    }

    const supplier = await this.prisma.supplier.create({
      data: createSupplierDto,
    });

    return {
      message: 'Supplier created successfully',
      supplier,
    };
  }

  async findAll(includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const suppliers = await this.prisma.supplier.findMany({
      where: { deletedAt: null },
      include,
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Suppliers fetched successfully',
      suppliers,
    };
  }

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    return {
      message: 'Supplier fetched successfully',
      supplier,
    };
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    const { taxCode } = updateSupplierDto;

    if (taxCode !== supplier.taxCode) {
      const existingSupplier = await this.prisma.supplier.findFirst({
        where: { taxCode, deletedAt: null },
      });
      if (existingSupplier) {
        throw new BadRequestException(
          `Supplier with tax code ${updateSupplierDto.taxCode} already exists`,
        );
      }
    }

    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });

    return {
      message: 'Supplier updated successfully',
      supplier: updatedSupplier,
    };
  }

  async remove(id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    await this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Supplier removed successfully',
    };
  }
}
