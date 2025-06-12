import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetTransferBatchDto } from './create-asset-transfer-batch.dto';

export class UpdateAssetTransferBatchDto extends PartialType(
  CreateAssetTransferBatchDto,
) {}
