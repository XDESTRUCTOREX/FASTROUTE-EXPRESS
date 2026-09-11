import { Type } from 'class-transformer';
import { IsPositive, IsString, MinLength } from 'class-validator';

export class CreatePackageDto {
  @Type(() => Number)
  @IsPositive()
  weight: number;

  @IsString()
  @MinLength(1)
  description: string;
}
