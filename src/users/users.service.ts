import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto;

    // Kiểm tra xem email đã tồn tại trong các user chưa xóa chưa
    const existingUser = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash mật khẩu và tạo user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...rest,
        email,
        password: hashedPassword,
      },
    });
    // Loại bỏ password khỏi response
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: { office: true },
    });
    // Loại bỏ password khỏi response, dùng _password để tránh lỗi ESLint
    return users.map((user) => {
      const { password: _password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async findOne(id: number) {
    if (id <= 0) {
      throw new BadRequestException('ID must be a positive number');
    }
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: { office: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // Loại bỏ password khỏi response, dùng _password để tránh lỗi ESLint
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (id <= 0) {
      throw new BadRequestException('ID must be a positive number');
    }
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { password, email, ...rest } = updateUserDto;

    // Nếu cập nhật email, kiểm tra trùng lặp trong các user chưa xóa
    if (email && email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email, deletedAt: null },
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const data = password
      ? { ...rest, email, password: await bcrypt.hash(password, 10) }
      : { ...rest, email };
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    if (id <= 0) {
      throw new BadRequestException('ID must be a positive number');
    }
    const user = await this.prisma.user.findUnique({
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
