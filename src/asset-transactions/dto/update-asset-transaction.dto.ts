import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetTransactionDto } from './create-asset-transaction.dto';

export class UpdateAssetTransactionDto extends PartialType(
  CreateAssetTransactionDto,
) {}
