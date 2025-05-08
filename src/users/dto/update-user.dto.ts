import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

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

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address: string;

  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  avatar: string;

  @IsOptional()
  @IsNumber({}, { message: 'Department ID must be a number' })
  departmentId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Office ID must be a number' })
  officeId: number;
}
