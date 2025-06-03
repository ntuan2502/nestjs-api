import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  private async findActiveOrFail(id: string) {
    const data = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`department with id ${id} not found`);
    }

    return data;
  }

  private async validateUnique(name: string, exclude?: string) {
    const data = await this.prisma.department.findFirst({
      where: {
        name,
        deletedAt: null,
        ...(exclude ? { NOT: { id: exclude } } : {}),
      },
    });

    if (data) {
      throw new BadRequestException(
        `department with name ${name} already exists`,
      );
    }
  }

  async create(req: AuthRequest, createDepartmentDto: CreateDepartmentDto) {
    const { name } = createDepartmentDto;
    await this.validateUnique(name);

    const department = await this.prisma.department.create({
      data: { ...createDepartmentDto, createdById: req.user.sub },
    });

    return {
      message: 'Department created successfully',
      department,
    };
  }

  async findAll(isDeleted: boolean = false) {
    const whereClause = isDeleted ? undefined : { deletedAt: null };
    const departments = await this.prisma.department.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Departments fetched successfully',
      departments,
    };
  }

  async findOne(id: string, isDeleted: boolean = false) {
    const whereClause: Prisma.DepartmentWhereInput = { id };
    if (!isDeleted) {
      whereClause.deletedAt = null;
    }
    const department = await this.prisma.department.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }

    return {
      message: 'Department fetched successfully',
      department,
    };
  }

  async update(
    req: AuthRequest,
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ) {
    await this.findActiveOrFail(id);

    const { name } = updateDepartmentDto;
    if (name) {
      await this.validateUnique(name, id);
    }

    const updatedDepartment = await this.prisma.department.update({
      where: { id },
      data: { ...updateDepartmentDto, updatedById: req.user.sub },
    });

    return {
      message: 'Department updated successfully',
      department: updatedDepartment,
    };
  }

  async remove(req: AuthRequest, id: string) {
    await this.findActiveOrFail(id);

    await this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: req.user.sub },
    });

    return {
      message: 'Department removed successfully',
    };
  }
}
