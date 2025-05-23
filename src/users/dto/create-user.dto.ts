import { Gender } from '@prisma/client';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @MinLength(1, { message: 'email must not be empty' })
  email: string;

  @IsOptional()
  @IsString({ message: 'password must be a string' })
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'password must include uppercase, lowercase, number, and special character',
  })
  password?: string;

  @IsOptional()
  @IsString({ message: 'name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'gender must be a string' })
  gender?: Gender;

  @IsOptional()
  @IsString({ message: 'dob must be a string' })
  dob?: Date;

  @IsOptional()
  @IsString({ message: 'phone must be a string' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'address must be a string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'avatar must be a string' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: 'departmentId must be a string' })
  departmentId?: string;

  @IsOptional()
  @IsString({ message: 'officeId must be a string' })
  officeId?: string;
}
