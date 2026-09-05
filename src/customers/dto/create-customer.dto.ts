import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  address!: string;
}