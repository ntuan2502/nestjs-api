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
    const existingDepartment = await this.prisma.department.findFirst({
      where: { name: createDepartmentDto.name, deletedAt: null },
    });

    if (existingDepartment) {
      throw new BadRequestException(
        `Department with name ${createDepartmentDto.name} already exists`,
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
    });

    return {
      message: 'Departments fetched successfully',
      departments,
    };
  }

  async findOne(id: number, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const department = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return {
      message: 'Department fetched successfully',
      department,
    };
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
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

  async remove(id: number) {
    const department = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
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
