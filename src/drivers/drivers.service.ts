import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driversRepository: Repository<Driver>,
  ) {}

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    const existingDriver = await this.driversRepository.findOne({
      where: { licenseNumber: createDriverDto.licenseNumber },
    });

    if (existingDriver) {
      throw new ConflictException('La licencia ya está registrada');
    }

    const driver = this.driversRepository.create(createDriverDto);
    return this.driversRepository.save(driver);
  }

  findAll(): Promise<Driver[]> {
    return this.driversRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Driver> {
    const driver = await this.driversRepository.findOne({ where: { id } });

    if (!driver) {
      throw new NotFoundException(`No existe un conductor con el ID ${id}`);
    }

    return driver;
  }

  async update(id: number, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.findOne(id);

    if (
      updateDriverDto.licenseNumber &&
      updateDriverDto.licenseNumber !== driver.licenseNumber
    ) {
      const existingDriver = await this.driversRepository.findOne({
        where: { licenseNumber: updateDriverDto.licenseNumber },
      });

      if (existingDriver) {
        throw new ConflictException('La licencia ya está registrada');
      }
    }

    Object.assign(driver, updateDriverDto);
    return this.driversRepository.save(driver);
  }

  async remove(id: number): Promise<Driver> {
    const driver = await this.findOne(id);
    driver.isActive = false;
    return this.driversRepository.save(driver);
  }
}