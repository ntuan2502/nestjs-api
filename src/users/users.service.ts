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
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    let constPassword = password || '';

    if (!password) {
      constPassword = 'Amata@123';
      // throw new BadRequestException('Password is required');
    }

    const hashedPassword = await bcrypt.hash(constPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        email,
        password: hashedPassword,
      },
    });

    return {
      message: 'User created successfully',
      user: omitFields(user, ['password']),
    };
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

  async findOne(id: string, includeParam?: string | string[]) {
    const include = parseInclude(includeParam);

    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return {
      message: 'User fetched successfully',
      user: omitFields(user, ['password']),
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const { email, password: _password, ...rest } = updateUserDto;

    if (email !== user.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: { email, deletedAt: null },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
      },
    });

    return {
      message: 'User updated successfully',
      user: omitFields(updatedUser, ['password']),
    };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return {
      message: 'User deleted successfully',
    };
  }
}
