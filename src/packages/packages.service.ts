import { Injectable } from '@nestjs/common';

@Injectable()
export class PackagesService {
  // Tarifa fija por kilo
  readonly tarifaPorKilo = 5000;

  // Suma el peso acumulado de todos los paquetes del envio
  calcularPesoTotal(packages: Array<{ weight: number }>): number {
    const total = packages.reduce((suma, pkg) => suma + Number(pkg.weight), 0);
    return Number(total.toFixed(2));
  }

  // Aplica la tarifa fija por kilo al peso total
  calcularCostoTotal(packages: Array<{ weight: number }>): number {
    const pesoTotal = this.calcularPesoTotal(packages);
    return Number((pesoTotal * this.tarifaPorKilo).toFixed(2));
  }
}