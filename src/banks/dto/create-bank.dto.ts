import { IsOptional, IsString, MinLength } from 'class-validator';
export class CreateBankDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Short name must be a string' })
  @MinLength(1, { message: 'Short name must not be empty' })
  shortName?: string;
}
