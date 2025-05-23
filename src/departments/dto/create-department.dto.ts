import { IsString, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString({ message: 'name must be a string' })
  @MinLength(1, { message: 'name must not be empty' })
  name: string;
}
