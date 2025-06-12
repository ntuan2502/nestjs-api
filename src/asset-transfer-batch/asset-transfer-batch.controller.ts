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
import { AssetTransferBatchService } from './asset-transfer-batch.service';
import { CreateAssetTransferBatchDto } from './dto/create-asset-transfer-batch.dto';
import { UpdateAssetTransferBatchDto } from './dto/update-asset-transfer-batch.dto';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { TransactionType } from '@prisma/client';
import { Public } from 'src/common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('asset-transfer-batch')
export class AssetTransferBatchController {
  constructor(
    private readonly assetTransferBatchService: AssetTransferBatchService,
  ) {}

  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() createAssetTransferBatchDto: CreateAssetTransferBatchDto,
  ) {
    return this.assetTransferBatchService.create(
      req,
      createAssetTransferBatchDto,
    );
  }

  @Get()
  findAll(@Query('isDeleted') isDeleted?: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.assetTransferBatchService.findAll(shouldIncludeDeleted);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('isDeleted') isDeleted: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.assetTransferBatchService.findOne(id, shouldIncludeDeleted);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateAssetTransferBatchDto: UpdateAssetTransferBatchDto,
  ) {
    return this.assetTransferBatchService.update(
      req,
      id,
      updateAssetTransferBatchDto,
    );
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.assetTransferBatchService.remove(req, id);
  }

  @Public()
  @Get('confirm-request/:id')
  getConfirmRequest(
    @Param('id') id: string,
    @Query('type') type: TransactionType,
  ) {
    return this.assetTransferBatchService.getConfirmRequest(id, type);
  }

  @Public()
  @Post('confirm-request/:id')
  @UseInterceptors(FileInterceptor('toSignature'))
  confirmRequest(
    @Param('id') id: string,
    @Query('type') type: TransactionType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.assetTransferBatchService.confirmRequest(id, type, file);
  }
}
