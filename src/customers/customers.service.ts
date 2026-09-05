import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const exists = await this.customerRepository.findOneBy({ email: dto.email });
    if (exists) {
      throw new ConflictException(`El email ${dto.email} ya esta registrado`);
    }
    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<{ message: string }> {
    const customer = await this.findOne(id);
    try {
      await this.customerRepository.remove(customer);
      return { message: `Cliente "${customer.name}" eliminado correctamente` };
    } catch {
      throw new ConflictException('No se puede eliminar: el cliente tiene envios asociados');
    }
  }
}