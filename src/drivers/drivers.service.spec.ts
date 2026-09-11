/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { DriversService } from './drivers.service';
import { Driver } from './entities/driver.entity';

describe('DriversService', () => {
  let service: DriversService;
  let repository: jest.Mocked<Partial<Repository<Driver>>>;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    service = new DriversService(repository as Repository<Driver>);
  });

  it('rechaza una licencia duplicada al crear', async () => {
    repository.findOne!.mockResolvedValue({ id: 1 } as Driver);

    await expect(
      service.create({
        fullName: 'Ana Perez',
        licenseNumber: 'LIC-001',
        phone: '3001234567',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('desactiva lógicamente un conductor existente', async () => {
    const driver = {
      id: 1,
      isActive: true,
    } as Driver;
    repository.findOne!.mockResolvedValue(driver);
    repository.save!.mockResolvedValue(driver);

    await expect(service.remove(1)).resolves.toBe(driver);
    expect(driver.isActive).toBe(false);
    expect(repository.save).toHaveBeenCalledWith(driver);
  });

  it('lanza NotFoundException cuando el conductor no existe', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
