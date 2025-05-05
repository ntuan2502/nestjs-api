import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAssetDto {
  @IsString({ message: 'Account name must be a string' })
  @MinLength(1, { message: 'Account number must not be empty' })
  internalCode: string;

  @IsString({ message: 'Account number must be a string' })
  @MinLength(1, { message: 'Account number must not be empty' })
  serialNumber: string;

  @IsString({ message: 'Purchase date must be a string' })
  purchaseDate: Date;

  @IsString({ message: 'Warranty until must be a string' })
  warrantyDuration: string;

  @IsString({ message: 'Status must be a string' })
  @MinLength(1, { message: 'Status must not be empty' })
  status: string;

  @IsOptional()
  @IsObject({ message: 'customProperties must be a valid JSON object' })
  @Type(() => Object)
  customProperties?: Record<string, any>;

  @IsOptional()
  deviceModelId?: number;
  @IsOptional()
  deviceTypeId?: number;
  @IsOptional()
  supplierId?: number;
  @IsOptional()
  departmentId?: number;
  @IsOptional()
  officeId?: number;
  @IsOptional()
  userId?: number;
}
