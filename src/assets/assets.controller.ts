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
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Req() req: AuthRequest, @Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(req, createAssetDto);
  }

  @Get()
  findAll(
    @Query('include') includeParam?: string | string[],
    @Query('filter') filter?: string | string[],
  ) {
    return this.assetsService.findAll(includeParam, filter);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('include') includeParam?: string | string[],
  ) {
    return this.assetsService.findOne(id, includeParam);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}
