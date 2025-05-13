import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSupplierDto {
  @IsString({ message: 'name must be a string' })
  @MinLength(1, { message: 'name must not be empty' })
  name: string;

  @IsOptional()
  @IsString({ message: 'address must be a string' })
  address?: string;

  @IsString({ message: 'taxCode must be a string' })
  @MinLength(1, { message: 'taxCode must not be empty' })
  taxCode: string;

  @IsOptional()
  @IsString({ message: 'phone must be a string' })
  phone?: string;
}
