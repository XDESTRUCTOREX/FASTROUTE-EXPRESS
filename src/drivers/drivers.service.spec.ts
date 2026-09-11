/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { DriversService } from './drivers.service';
import { Driver } from './driver.entity';

describe('DriversService', () => {
  let service: DriversService;
  let repository: jest.Mocked<Partial<Repository<Driver>>>;

  beforeEach(() => {
    repository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };
    service = new DriversService(repository as Repository<Driver>);
  });

  it('rechaza una licencia duplicada al crear', async () => {
    repository.findOneBy!.mockResolvedValue({ id: 1 } as Driver);

    await expect(
      service.create({
        name: 'Ana Perez',
        license: 'LIC-001',
        phone: '3001234567',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('elimina un conductor existente', async () => {
    const driver = { id: 1, name: 'Ana Perez' } as Driver;
    repository.findOneBy!.mockResolvedValue(driver);
    repository.remove!.mockResolvedValue(driver);

    await expect(service.remove(1)).resolves.toEqual({
      message: 'Conductor "Ana Perez" eliminado correctamente',
    });
    expect(repository.remove).toHaveBeenCalledWith(driver);
  });

  it('lanza NotFoundException cuando el conductor no existe', async () => {
    repository.findOneBy!.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
