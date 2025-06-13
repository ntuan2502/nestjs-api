import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Req() req: AuthRequest, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(req, createUserDto);
  }

  @Get()
  findAll(@Query('isDeleted') isDeleted?: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.usersService.findAll(shouldIncludeDeleted);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('isDeleted') isDeleted: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.usersService.findOne(id, shouldIncludeDeleted);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req, id, updateUserDto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.usersService.remove(req, id);
  }
}
