import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AssetTransferBatchesService } from './asset-transfer-batches.service';
import { CreateAssetTransferBatchDto } from './dto/create-asset-transfer-batch.dto';
import { UpdateAssetTransferBatchDto } from './dto/update-asset-transfer-batch.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { TransactionType } from '@prisma/client';
import { Public } from 'src/common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('asset-transfer-batches')
export class AssetTransferBatchesController {
  constructor(
    private readonly assetTransferBatchesService: AssetTransferBatchesService,
  ) {}

  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() createAssetTransferBatchDto: CreateAssetTransferBatchDto,
  ) {
    return this.assetTransferBatchesService.create(
      req,
      createAssetTransferBatchDto,
    );
  }

  @Get()
  findAll(@Query('isDeleted') isDeleted?: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.assetTransferBatchesService.findAll(shouldIncludeDeleted);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('isDeleted') isDeleted: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.assetTransferBatchesService.findOne(id, shouldIncludeDeleted);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateAssetTransferBatchDto: UpdateAssetTransferBatchDto,
  ) {
    return this.assetTransferBatchesService.update(
      req,
      id,
      updateAssetTransferBatchDto,
    );
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.assetTransferBatchesService.remove(req, id);
  }

  @Public()
  @Get('confirm-request/:id')
  getConfirmRequest(
    @Param('id') id: string,
    @Query('type') type: TransactionType,
  ) {
    return this.assetTransferBatchesService.getConfirmRequest(id, type);
  }

  @Public()
  @Post('confirm-request/:id')
  @UseInterceptors(FileInterceptor('toSignature'))
  confirmRequest(
    @Param('id') id: string,
    @Query('type') type: TransactionType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.assetTransferBatchesService.confirmRequest(id, type, file);
  }
}
