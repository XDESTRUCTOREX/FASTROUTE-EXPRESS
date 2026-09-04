import { Body, Controller, Post } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { PackageService } from './package.service';

@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post('calculate')
  calcularCosto(@Body() paquetes: CreatePackageDto[]) {
    return this.packageService.calcularCosto(paquetes);
  }
}