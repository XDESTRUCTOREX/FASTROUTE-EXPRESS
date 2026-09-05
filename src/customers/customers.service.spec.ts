/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Customer } from './entities/customer.entity';
import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: jest.Mocked<Partial<Repository<Customer>>>;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };
    service = new CustomersService(repository as Repository<Customer>);
  });

  it('rechaza un correo duplicado al crear', async () => {
    repository.findOne!.mockResolvedValue({ id: 1 } as Customer);

    await expect(
      service.create({
        fullName: 'Luis Gomez',
        email: 'luis@example.com',
        phone: '3001234567',
        address: 'Calle 1 # 2-3',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('elimina un cliente existente', async () => {
    const customer = { id: 1 } as Customer;
    repository.findOne!.mockResolvedValue(customer);
    repository.remove!.mockResolvedValue(customer);

    await service.remove(1);

    expect(repository.remove).toHaveBeenCalledWith(customer);
  });

  it('lanza NotFoundException cuando el cliente no existe', async () => {
    repository.findOne!.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
