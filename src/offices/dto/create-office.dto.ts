import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateOfficeDto {
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'internationalName must be a string' })
  internationalName?: string;

  @IsOptional()
  @IsString({ message: 'shortName must be a string' })
  shortName?: string;

  @IsString({ message: 'taxCode must be a string' })
  @MinLength(1, { message: 'taxCode must not be empty' })
  taxCode: string;

  @IsOptional()
  @IsString({ message: 'address must be a string' })
  address?: string;
}
