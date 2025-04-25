import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const department = await this.prisma.department.create({
      data: createDepartmentDto,
    });

    return {
      message: 'Department created successfully',
      department,
    };
  }

  async findAll() {
    const departments = await this.prisma.department.findMany({
      where: { deletedAt: null },
      include: { users: true },
    });

    return {
      message: 'Departments fetched successfully',
      departments,
    };
  }

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id, deletedAt: null },
      include: { users: true },
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
    const department = await this.prisma.department.findUnique({
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
    const department = await this.prisma.department.findUnique({
      where: { id, deletedAt: null },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    const deletedDepartment = await this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return {
      message: 'Department removed successfully',
      department: deletedDepartment,
    };
  }
}
