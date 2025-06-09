import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { AssetTransactionsService } from './asset-transactions.service';
import { CreateAssetTransactionDto } from './dto/create-asset-transaction.dto';
import { UpdateAssetTransactionDto } from './dto/update-asset-transaction.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { Public } from 'src/common/decorators/public.decorator';
import { TransactionType } from '@prisma/client';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('asset-transactions')
export class AssetTransactionsController {
  constructor(
    private readonly assetTransactionsService: AssetTransactionsService,
  ) {}

  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() createAssetTransactionDto: CreateAssetTransactionDto,
  ) {
    return this.assetTransactionsService.create(req, createAssetTransactionDto);
  }

  @Get()
  findAll(
    @Query('isDeleted') isDeleted?: string,
    @Query('filter') filter?: string | string[],
  ) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.assetTransactionsService.findAll(shouldIncludeDeleted, filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('isDeleted') isDeleted: string) {
    const shouldIncludeDeleted = isDeleted === 'true';
    return this.assetTransactionsService.findOne(id, shouldIncludeDeleted);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fromSignature', maxCount: 1 },
      { name: 'toSignature', maxCount: 1 },
    ]),
  )
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateAssetTransactionDto: UpdateAssetTransactionDto,
  ) {
    return this.assetTransactionsService.update(
      req,
      id,
      updateAssetTransactionDto,
    );
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.assetTransactionsService.remove(req, id);
  }

  @Post('create-request')
  @UseInterceptors(FileInterceptor('fromSignature'))
  createRequest(
    @Req() req: AuthRequest,
    @Body() createAssetTransactionDto: CreateAssetTransactionDto,
    @UploadedFile() files: Express.Multer.File,
  ) {
    return this.assetTransactionsService.createRequest(
      req,
      createAssetTransactionDto,
      files,
    );
  }

  @Public()
  @Get('confirm-request/:id')
  getConfirmRequest(
    @Param('id') id: string,
    @Query('type') type: TransactionType,
  ) {
    return this.assetTransactionsService.getConfirmRequest(id, type);
  }

  @Public()
  @Post('confirm-request/:id')
  @UseInterceptors(FilesInterceptor('toSignature'))
  confirmRequest(
    @Param('id') id: string,
    @Query('type') type: TransactionType,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const toSignatureFile = files?.[0];

    return this.assetTransactionsService.confirmRequest(
      id,
      type,
      toSignatureFile,
    );
  }
}
