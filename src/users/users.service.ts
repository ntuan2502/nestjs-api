import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { omitFields } from 'src/common/utils/omit';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async findActiveOrFail(id: string) {
    const data = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!data) {
      throw new NotFoundException(`user with id ${id} not found`);
    }

    return data;
  }

  private async validateUnique(email: string, exclude?: string) {
    const data = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        ...(exclude ? { NOT: { id: exclude } } : {}),
      },
    });

    if (data) {
      throw new BadRequestException(`user with email ${email} already exists`);
    }
  }

  async create(req: AuthRequest, createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto;
    await this.validateUnique(email);

    const defaultPassword = password || 'Amata@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        email,
        password: hashedPassword,
        createdById: req.user.sub,
      },
    });

    return {
      message: 'User created successfully',
      user: omitFields(user, ['password']),
    };
  }

  async findAll(isDeleted: boolean = false) {
    const whereClause = isDeleted ? undefined : { deletedAt: null };

    const users = await this.prisma.user.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Users fetched successfully',
      users: users.map((user) => {
        return omitFields(user, ['password']);
      }),
    };
  }

  async findOne(id: string, isDeleted: boolean = false) {
    const whereClause: Prisma.UserWhereInput = { id };

    if (!isDeleted) {
      whereClause.deletedAt = null;
    }

    const user = await this.prisma.user.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        updatedBy: { select: { id: true, email: true, name: true } },
        deletedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return {
      message: 'User fetched successfully',
      user: omitFields(user, ['password']),
    };
  }

  async update(req: AuthRequest, id: string, updateUserDto: UpdateUserDto) {
    await this.findActiveOrFail(id);

    const { email, password: _password, ...rest } = updateUserDto;

    if (email) {
      await this.validateUnique(email, id);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        updatedById: req.user.sub,
      },
    });

    return {
      message: 'User updated successfully',
      user: omitFields(updatedUser, ['password']),
    };
  }

  async remove(req: AuthRequest, id: string) {
    await this.findActiveOrFail(id);

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: req.user.sub },
    });
    return {
      message: 'User deleted successfully',
    };
  }
}
