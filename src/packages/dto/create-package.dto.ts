import { IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  // @Type convierte a numero el valor que llega por JSON
  @Type(() => Number)
  @IsPositive({ message: 'El peso debe ser un numero positivo' })
  weight: number;
}