import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AssetTransferBatchService } from './asset-transfer-batch.service';
import { AssetTransferBatchController } from './asset-transfer-batch.controller';

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
  controllers: [AssetTransferBatchController],
  providers: [AssetTransferBatchService],
})
export class AssetTransferBatchModule {}
