import { Injectable } from '@nestjs/common';

@Injectable()
export class PackagesService {
  // Tarifa fija por kilogramo.
  readonly tarifaPorKilo = 5000;

  calcularPesoTotal(
    packages: Array<{ weight: number }>,
  ): number {
    const total = packages.reduce(
      (suma, pkg) => suma + Number(pkg.weight),
      0,
    );

    return Number(total.toFixed(2));
  }

  calcularCostoTotal(
    packages: Array<{ weight: number }>,
  ): number {
    const pesoTotal = this.calcularPesoTotal(packages);

    return Number(
      (pesoTotal * this.tarifaPorKilo).toFixed(2),
    );
  }
}