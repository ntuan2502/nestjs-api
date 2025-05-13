import { WarrantyYear } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAssetDto {
  @IsString({ message: 'internalCode must be a string' })
  @MinLength(1, { message: 'internalCode must not be empty' })
  internalCode: string;

  @IsOptional()
  @IsString({ message: 'serialNumber must be a string' })
  serialNumber?: string;

  @IsOptional()
  @IsString({ message: 'purchaseDate must be a string' })
  purchaseDate?: Date;

  @IsOptional()
  @IsString({ message: 'warrantyYears must be a string' })
  warrantyYears?: WarrantyYear;

  @IsOptional()
  @IsObject({ message: 'customProperties must be a valid JSON object' })
  @Type(() => Object)
  customProperties?: Record<string, any>;

  @IsOptional()
  @IsString({ message: 'deviceModelId must be a string' })
  deviceModelId?: string;

  @IsOptional()
  @IsString({ message: 'deviceTypeId must be a string' })
  deviceTypeId?: string;

  @IsOptional()
  @IsString({ message: 'supplierId must be a string' })
  supplierId?: string;
}
