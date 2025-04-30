import { IsOptional, IsString, MinLength } from 'class-validator';
export class CreateBankAccountDto {
  @IsString({ message: 'Account name must be a string' })
  @MinLength(1, { message: 'Account number must not be empty' })
  accountName: string;

  @IsString({ message: 'Account number must be a string' })
  @MinLength(1, { message: 'Account number must not be empty' })
  accountNumber: string;

  @IsOptional()
  bankId?: number;

  @IsOptional()
  supplierId?: number;
}
