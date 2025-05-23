import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAssetTransactionDto {
  @IsOptional()
  @IsString({ message: 'note must be a string' })
  note?: string;

  @IsOptional()
  @IsObject({ message: 'customProperties must be a valid JSON object' })
  @Type(() => Object)
  files?: Record<string, any>;

  @IsString({ message: 'type must be a string' })
  @MinLength(1, { message: 'type must not be empty' })
  type: TransactionType;

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
}
