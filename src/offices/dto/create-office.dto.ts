import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateOfficeDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  name: string;

  @IsString({ message: 'International name must be a string' })
  @IsOptional()
  internationalName?: string;

  @IsString({ message: 'Short name must be a string' })
  @IsOptional()
  shortName?: string;

  @IsString({ message: 'Tax code must be a string' })
  @MinLength(1, { message: 'Tax code must not be empty' })
  taxCode: string;

  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  address?: string;
}
