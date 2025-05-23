import { IsOptional, IsString, MinLength } from 'class-validator';
export class CreateBankAccountDto {
  @IsString({ message: 'accountNumber must be a string' })
  @MinLength(1, { message: 'accountNumber must not be empty' })
  accountNumber: string;

  @IsString({ message: 'accountName must be a string' })
  @MinLength(1, { message: 'accountName must not be empty' })
  accountName: string;

  @IsOptional()
  supplierId?: string;

  @IsOptional()
  bankId?: string;
}
