import { Gender } from '@prisma/client';
import { IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  name: string;

  @IsString({ message: 'gender must be a string' })
  @MinLength(1, { message: 'gender must not be empty' })
  gender: Gender;

  @IsString({ message: 'dob must be a string' })
  dob: Date;

  @IsString({ message: 'phone must be a string' })
  @MinLength(1, { message: 'phone must not be empty' })
  phone: string;

  @IsString({ message: 'address must be a string' })
  address: string;

  @IsString({ message: 'avatar must be a string' })
  avatar: string;
}
