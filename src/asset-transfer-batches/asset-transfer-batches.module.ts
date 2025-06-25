import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AssetTransferBatchesService } from './asset-transfer-batches.service';
import { AssetTransferBatchesController } from './asset-transfer-batches.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './public/signed',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [AssetTransferBatchesController],
  providers: [AssetTransferBatchesService],
})
export class AssetTransferBatchesModule {}
