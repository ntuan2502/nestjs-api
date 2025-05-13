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
import { FileFieldsInterceptor } from '@nestjs/platform-express';

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
    @UploadedFiles()
    files: {
      fromSignature?: Express.Multer.File[];
      toSignature?: Express.Multer.File[];
    },
  ) {
    const fromSignatureFile = files.fromSignature
      ? files.fromSignature[0]
      : undefined;
    const toSignatureFile = files.toSignature
      ? files.toSignature[0]
      : undefined;

    return this.assetTransactionsService.update(
      id,
      updateAssetTransactionDto,
      fromSignatureFile,
      toSignatureFile,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetTransactionsService.remove(id);
  }
}
