import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  private async findActiveOrFail(id: string) {
    const data = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`supplier with id ${id} not found`);
    }

    return data;
  }

  private async validateUnique(taxCode: string, exclude?: string) {
    const data = await this.prisma.supplier.findFirst({
      where: {
        taxCode,
        deletedAt: null,
        ...(exclude ? { NOT: { id: exclude } } : {}),
      },
    });

    if (data) {
      throw new BadRequestException(
        `supplier with taxCode ${taxCode} already exists`,
      );
    }
  }

  async create(req: AuthRequest, createSupplierDto: CreateSupplierDto) {
    const { taxCode } = createSupplierDto;
    await this.validateUnique(taxCode);

    const supplier = await this.prisma.supplier.create({
      data: { ...createSupplierDto, createdById: req.user.sub },
    });

    return {
      message: 'Supplier created successfully',
      supplier,
    };
  }

  async findAll(isDeleted: boolean = false) {
    const whereClause = isDeleted ? undefined : { deletedAt: null };

    const suppliers = await this.prisma.supplier.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Suppliers fetched successfully',
      suppliers,
    };
  }

  async findOne(id: string, isDeleted: boolean = false) {
    const whereClause: Prisma.SupplierWhereInput = { id };

    if (!isDeleted) {
      whereClause.deletedAt = null;
    }

    const supplier = await this.prisma.supplier.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    return {
      message: 'Supplier fetched successfully',
      supplier,
    };
  }

  async update(
    req: AuthRequest,
    id: string,
    updateSupplierDto: UpdateSupplierDto,
  ) {
    await this.findActiveOrFail(id);

    const { taxCode } = updateSupplierDto;
    if (taxCode) {
      await this.validateUnique(taxCode, id);
    }

    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: { ...updateSupplierDto, updatedById: req.user.sub },
    });

    return {
      message: 'Supplier updated successfully',
      supplier: updatedSupplier,
    };
  }

  async remove(req: AuthRequest, id: string) {
    await this.findActiveOrFail(id);

    await this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: req.user.sub },
    });

    return {
      message: 'Supplier removed successfully',
    };
  }
}
