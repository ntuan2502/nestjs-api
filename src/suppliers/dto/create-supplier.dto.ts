import { IsString, MinLength } from 'class-validator';

export class CreateSupplierDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  name: string;

  @IsString({ message: 'Address must be a string' })
  @MinLength(1, { message: 'Address must not be empty' })
  address: string;

  @IsString({ message: 'Tax code must be a string' })
  @MinLength(1, { message: 'Tax code must not be empty' })
  taxCode: string;

  @IsString({ message: 'Phone must be a string' })
  @MinLength(1, { message: 'Phone must not be empty' })
  phone: string;
}
