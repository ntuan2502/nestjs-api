import {
  IsEmail,
  IsString,
  MinLength,
  IsInt,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Password must include uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must not be empty' })
  name: string;

  @IsInt({ message: 'Office ID must be an integer' })
  @IsOptional()
  officeId?: number;
}
