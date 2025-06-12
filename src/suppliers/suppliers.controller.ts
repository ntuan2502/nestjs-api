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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() createSupplierDto: CreateSupplierDto,
  ) {
    return this.suppliersService.create(req, createSupplierDto);
  }

  @Get()
  findAll(@Query('isDeleted') isDeleted?: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.suppliersService.findAll(shouldIncludeDeleted);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('isDeleted') isDeleted: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.suppliersService.findOne(id, shouldIncludeDeleted);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(req, id, updateSupplierDto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.suppliersService.remove(req, id);
  }
}
