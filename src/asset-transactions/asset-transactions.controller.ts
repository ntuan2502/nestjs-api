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
} from '@nestjs/common';
import { AssetTransactionsService } from './asset-transactions.service';
import { CreateAssetTransactionDto } from './dto/create-asset-transaction.dto';
import { UpdateAssetTransactionDto } from './dto/update-asset-transaction.dto';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('asset-transactions')
export class AssetTransactionsController {
  constructor(
    private readonly assetTransactionsService: AssetTransactionsService,
  ) {}

  @Post()
  create(@Body() createAssetTransactionDto: CreateAssetTransactionDto) {
    return this.assetTransactionsService.create(createAssetTransactionDto);
  }

  @Get()
  findAll(
    @Query('include') includeParam?: string | string[],
    @Query('filter') filter?: string | string[],
  ) {
    return this.assetTransactionsService.findAll(includeParam, filter);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('include') includeParam?: string | string[],
  ) {
    return this.assetTransactionsService.findOne(id, includeParam);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fromSignature', maxCount: 1 },
      { name: 'toSignature', maxCount: 1 },
    ]),
  )
  update(
    @Param('id') id: string,
    @Body() updateAssetTransactionDto: UpdateAssetTransactionDto,
  ) {
    return this.assetTransactionsService.update(id, updateAssetTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetTransactionsService.remove(id);
  }

  @Post('create-request')
  @UseInterceptors(FilesInterceptor('fromSignature'))
  createRequest(
    @Body() createAssetTransactionDto: CreateAssetTransactionDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const fromSignatureFile = files?.[0];

    return this.assetTransactionsService.createRequest(
      createAssetTransactionDto,
      fromSignatureFile,
    );
  }

  @Public()
  @Get('confirm-request/:id')
  getConfirmRequest(@Param('id') id: string) {
    return this.assetTransactionsService.getConfirmRequest(id);
  }

  @Public()
  @Post('confirm-request/:id')
  @UseInterceptors(FilesInterceptor('toSignature'))
  confirmRequest(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const toSignatureFile = files?.[0];

    return this.assetTransactionsService.confirmRequest(id, toSignatureFile);
  }

  @Get('create-handover/:id')
  createHandover(@Param('id') id: string) {
    return this.assetTransactionsService.createHandover(id);
  }
}
