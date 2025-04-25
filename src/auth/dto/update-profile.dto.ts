import { IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  name: string;

  @IsString({ message: 'Gender must be a string' })
  @MinLength(1, { message: 'Gender must not be empty' })
  gender: string;

  @IsString({ message: 'Date of Birth must be a string' })
  dob: Date;

  @IsString({ message: 'Phone must be a string' })
  @MinLength(1, { message: 'Phone must not be empty' })
  phone: string;

  @IsString({ message: 'Address must be a string' })
  address: string;

  @IsString({ message: 'Avatar must be a string' })
  avatar: string;
}
