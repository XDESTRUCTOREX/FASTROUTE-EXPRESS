import { PackagesService } from './packages.service';

describe('PackagesService', () => {
  let service: PackagesService;

  beforeEach(() => {
    service = new PackagesService();
  });

  it('debe calcular correctamente el peso total', () => {
    const packages = [
      { weight: 2 },
      { weight: 3.5 },
      { weight: 1.5 },
    ];

    expect(service.calcularPesoTotal(packages)).toBe(7);
  });

  it('debe calcular correctamente el costo total', () => {
    const packages = [
      { weight: 2 },
      { weight: 3 },
    ];

    expect(service.calcularCostoTotal(packages)).toBe(25000);
  });
});