import { Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';

@Injectable()
export class PackageService {
  private readonly tarifaPorKilo = 5000;

  calcularCosto(paquetes: CreatePackageDto[]) {
    const pesoTotal = paquetes.reduce(
      (total, paquete) => total + Number(paquete.weight),
      0,
    );

    const costoTotal = pesoTotal * this.tarifaPorKilo;

    return {
      pesoTotal,
      tarifaPorKilo: this.tarifaPorKilo,
      costoTotal,
    };
  }
}
