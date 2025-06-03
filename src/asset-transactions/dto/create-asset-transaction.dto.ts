import {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAssetTransactionDto {
  @IsString({ message: 'direction must be a string' })
  @MinLength(1, { message: 'direction must not be empty' })
  direction: TransactionDirection;

  @IsString({ message: 'type must be a string' })
  @MinLength(1, { message: 'type must not be empty' })
  type: TransactionType;

  @IsString({ message: 'status must be a string' })
  @MinLength(1, { message: 'status must not be empty' })
  status: TransactionStatus;

  @IsOptional()
  @IsString({ message: 'note must be a string' })
  note?: string;

  @IsString({ message: 'assetId must be a string' })
  assetId: string;

  @IsOptional()
  @IsString({ message: 'fromUserId must be a string' })
  fromUserId?: string;

  @IsOptional()
  @IsString({ message: 'toUserId must be a string' })
  toUserId?: string;

  @IsOptional()
  @IsString({ message: 'fromDepartmentId must be a string' })
  departmentId?: string;

  @IsOptional()
  @IsString({ message: 'toOfficeId must be a string' })
  officeId?: string;

  @IsOptional()
  @IsString({ message: 'transactionBatchId must be a string' })
  transactionBatchId?: string;

  @IsOptional()
  @IsString({ message: 'signatureId must be a string' })
  signatureId?: string;
}
