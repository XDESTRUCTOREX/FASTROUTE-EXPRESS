import {
  ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePackageDto } from '../../packages/dto/create-package.dto';

export class CreateShipmentDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  customerId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  driverId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  originBranchId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  destination: string;

  // Permite enviar el envio con sus paquetes en un solo JSON
  @IsArray()
  @ArrayMinSize(1, { message: 'El envio debe tener al menos un paquete' })
  @ValidateNested({ each: true })
  @Type(() => CreatePackageDto)
  packages: CreatePackageDto[];
}