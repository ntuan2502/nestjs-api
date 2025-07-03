import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AssetTransactionsService } from './asset-transactions.service';
import { AssetTransactionsController } from './asset-transactions.controller';
import { MailService } from 'src/mail/mail.service';

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
  controllers: [AssetTransactionsController],
  providers: [AssetTransactionsService, MailService],
})
export class AssetTransactionsModule {}
