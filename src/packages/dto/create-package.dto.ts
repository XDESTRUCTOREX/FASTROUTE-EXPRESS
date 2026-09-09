import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @Type(() => Number)
  @IsPositive()
  weight: number;
}