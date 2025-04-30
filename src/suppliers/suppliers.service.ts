import { BadRequestException, Injectable } from '@nestjs/common';
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
    });

    return {
      message: 'Suppliers fetched successfully',
      suppliers,
    };
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
      include: {
        bankAccounts: {
          include: { bank: true },
        },
      },
    });

    if (!supplier) {
      throw new BadRequestException(`Supplier with ID ${id} not found`);
    }

    return {
      message: 'Supplier fetched successfully',
      supplier,
    };
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });

    if (!supplier) {
      throw new BadRequestException(`Supplier with ID ${id} not found`);
    }

    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
      include: {
        bankAccounts: {
          include: { bank: true },
        },
      },
    });

    return {
      message: 'Supplier updated successfully',
      supplier: updatedSupplier,
    };
  }

  async remove(id: number) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });

    if (!supplier) {
      throw new BadRequestException(`Supplier with ID ${id} not found`);
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
