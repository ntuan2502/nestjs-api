import { IsOptional, IsString, MinLength } from 'class-validator';
export class CreateBankAccountDto {
  @IsString({ message: 'number must be a string' })
  @MinLength(1, { message: 'number must not be empty' })
  number: string;

  @IsString({ message: 'name must be a string' })
  @MinLength(1, { message: 'name must not be empty' })
  name: string;

  @IsOptional()
  supplierId?: string;

  @IsOptional()
  bankId?: string;
}
