import { IsString, MinLength } from 'class-validator';

export class CreateOfficeDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  name: string;

  @IsString({ message: 'Address must be a string' })
  @MinLength(1, { message: 'Address must not be empty' })
  address: string;
}
