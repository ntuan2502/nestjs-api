import { IsOptional, IsString, MinLength } from 'class-validator';
export class CreateBankDto {
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  name?: string;

  @IsString({ message: 'shortName name must be a string' })
  @MinLength(1, { message: 'shortName must not be empty' })
  shortName: string;
}
