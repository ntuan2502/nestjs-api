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
    @Query('isDeleted') isDeleted?: string,
    @Query('filter') filter?: string | string[],
  ) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.assetsService.findAll(shouldIncludeDeleted, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('isDeleted') isDeleted: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.assetsService.findOne(id, shouldIncludeDeleted);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(req, id, updateAssetDto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.assetsService.remove(req, id);
  }
}
