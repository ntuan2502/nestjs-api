import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OfficesService } from './offices.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';

@Controller('offices')
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Post()
  create(@Body() createOfficeDto: CreateOfficeDto) {
    return this.officesService.create(createOfficeDto);
  }

  @Get()
  findAll(@Query('include') includeParam?: string | string[]) {
    return this.officesService.findAll(includeParam);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('include') includeParam?: string | string[],
  ) {
    return this.officesService.findOne(id, includeParam);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfficeDto: UpdateOfficeDto) {
    return this.officesService.update(id, updateOfficeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.officesService.remove(id);
  }
}
