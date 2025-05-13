import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AssetTransactionsService } from './asset-transactions.service';
import { AssetTransactionsController } from './asset-transactions.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [AssetTransactionsController],
  providers: [AssetTransactionsService],
})
export class AssetTransactionsModule {}
