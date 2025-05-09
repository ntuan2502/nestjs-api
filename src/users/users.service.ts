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
import { parseInclude } from 'src/common/utils/parseInclude';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        email,
        password: hashedPassword,
      },
    });

    return omitFields(user, ['password']);
  }

  async findAll(includeParam?: string | string[]) {
    const include = parseInclude(includeParam);
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include,
      orderBy: { name: 'asc' },
    });

    return {
      message: 'Users fetched successfully',
      users: users.map((user) => {
        return omitFields(user, ['password']);
      }),
    };
  }

  async findOne(id: number, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);

    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      message: 'User fetched successfully',
      user: omitFields(user, ['password']),
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { email, ...rest } = updateUserDto;

    if (email && email !== user.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: { email, deletedAt: null },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const data = { ...rest, email };

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    if (id <= 0) {
      throw new BadRequestException('ID must be a positive number');
    }

    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
