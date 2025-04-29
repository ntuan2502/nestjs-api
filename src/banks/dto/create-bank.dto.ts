import { IsString, MinLength } from 'class-validator';
export class CreateBankDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  name: string;

  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  accountNumber: string;
}
