import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async create(dto: CreateDriverDto): Promise<Driver> {
    const exists = await this.driverRepository.findOneBy({ license: dto.license });
    if (exists) {
      throw new ConflictException(`Ya existe un conductor con la licencia ${dto.license}`);
    }
    const driver = this.driverRepository.create(dto);
    return this.driverRepository.save(driver);
  }

  findAll(): Promise<Driver[]> {
    return this.driverRepository.find();
  }

  async findOne(id: number): Promise<Driver> {
    const driver = await this.driverRepository.findOneBy({ id });
    if (!driver) throw new NotFoundException(`Conductor con id ${id} no encontrado`);
    return driver;
  }

  async update(id: number, dto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.findOne(id);
    Object.assign(driver, dto);
    return this.driverRepository.save(driver);
  }

  async remove(id: number): Promise<{ message: string }> {
    const driver = await this.findOne(id);
    try {
      await this.driverRepository.remove(driver);
      return { message: `Conductor "${driver.name}" eliminado correctamente` };
    } catch {
      throw new ConflictException('No se puede eliminar: el conductor tiene envios asociados');
    }
  }
}