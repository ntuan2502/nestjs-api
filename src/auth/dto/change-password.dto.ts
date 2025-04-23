import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Old password must be a string' })
  @MinLength(8, { message: 'Old password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Old password must include uppercase, lowercase, number, and special character',
  })
  oldPassword: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'New password must include uppercase, lowercase, number, and special character',
  })
  newPassword: string;
}
