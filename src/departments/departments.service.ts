import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseInclude } from 'src/common/utils/parseInclude';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { name } = createDepartmentDto;
    const existingDepartment = await this.prisma.department.findFirst({
      where: { name, deletedAt: null },
    });

    if (existingDepartment) {
      throw new BadRequestException(
        `Department with name ${name} already exists`,
      );
    }

    const department = await this.prisma.department.create({
      data: createDepartmentDto,
    });

    return {
      message: 'Department created successfully',
      department,
    };
  }

  async findAll(includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const departments = await this.prisma.department.findMany({
      where: { deletedAt: null },
      include,
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Departments fetched successfully',
      departments,
    };
  }

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const department = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }

    return {
      message: 'Department fetched successfully',
      department,
    };
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });

    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }

    const { name } = updateDepartmentDto;
    const existingDepartment = await this.prisma.department.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
    if (existingDepartment) {
      throw new BadRequestException(
        `Department with name ${name} already exists`,
      );
    }

    const updatedDepartment = await this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
    });

    return {
      message: 'Department updated successfully',
      department: updatedDepartment,
    };
  }

  async remove(id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });

    if (!department) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }

    await this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Department removed successfully',
    };
  }
}
