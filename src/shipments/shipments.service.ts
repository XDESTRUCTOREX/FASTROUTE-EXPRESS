import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './shipment.entity';
import { Customer } from '../customers/customer.entity';
import { Driver } from '../drivers/driver.entity';
import { Branch } from '../branches/branch.entity';
import { PackagesService } from '../packages/packages.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly packagesService: PackagesService,
  ) {}

  // ===== Creacion de envios con costo automatico =====
  async create(dto: CreateShipmentDto): Promise<Shipment> {
    const customer = await this.customerRepository.findOneBy({ id: dto.customerId });
    if (!customer) throw new NotFoundException(`Cliente con id ${dto.customerId} no encontrado`);

    const driver = await this.driverRepository.findOneBy({ id: dto.driverId });
    if (!driver) throw new NotFoundException(`Conductor con id ${dto.driverId} no encontrado`);

    const originBranch = await this.branchRepository.findOneBy({ id: dto.originBranchId });
    if (!originBranch) {
      throw new NotFoundException(`Sucursal con id ${dto.originBranchId} no encontrada`);
    }

    // Costo total: tarifa fija por kilo x peso total de los paquetes
    const totalCost = this.packagesService.calcularCostoTotal(dto.packages);

    const shipment = this.shipmentRepository.create({
      trackingCode: this.generarTrackingCode(),
      destination: dto.destination,
      customer,
      driver,
      originBranch,
      totalCost,
      packages: dto.packages,
    });

    return this.shipmentRepository.save(shipment);
  }

  private generarTrackingCode(): string {
    return `FRX-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
  }

  findOne(id: number) {
    return this.shipmentRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        driver: true,
        originBranch: true,
        packages: true,
      },
    });
  }

  // ===== Consultas avanzadas: detalle completo con QueryBuilder =====
  async findDetail(id: number) {
    const shipment = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.customer', 'customer')
      .leftJoinAndSelect('shipment.driver', 'driver')
      .leftJoinAndSelect('shipment.originBranch', 'branch')
      .leftJoinAndSelect('shipment.packages', 'packages')
      .where('shipment.id = :id', { id })
      .getOne();

    if (!shipment) {
      throw new NotFoundException(`Envio con id ${id} no encontrado`);
    }

    return {
      id: shipment.id,
      trackingCode: shipment.trackingCode,
      destination: shipment.destination,
      status: shipment.status,
      createdAt: shipment.createdAt,
      customer: {
        id: shipment.customer.id,
        name: shipment.customer.name,
        email: shipment.customer.email,
      },
      driver: {
        id: shipment.driver.id,
        name: shipment.driver.name,
      },
      originBranch: {
        id: shipment.originBranch.id,
        name: shipment.originBranch.name,
        city: shipment.originBranch.city,
      },
      packages: shipment.packages,
      resumen: {
        cantidadPaquetes: shipment.packages.length,
        pesoTotalKg: this.packagesService.calcularPesoTotal(shipment.packages),
        tarifaPorKilo: this.packagesService.tarifaPorKilo,
        costoTotal: shipment.totalCost,
      },
    };
  }

  // ===== Paginacion y filtros dinamicos =====
  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    filters: { customerId?: number; branchId?: number; date?: string },
  ) {
    const queryBuilder = this.shipmentRepository
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.customer', 'customer')
      .leftJoinAndSelect('shipment.driver', 'driver')
      .leftJoinAndSelect('shipment.originBranch', 'branch');

    if (filters.customerId) {
      queryBuilder.andWhere('customer.id = :customerId', { customerId: filters.customerId });
    }

    if (filters.branchId) {
      queryBuilder.andWhere('branch.id = :branchId', { branchId: filters.branchId });
    }

    if (filters.date) {
      queryBuilder.andWhere('DATE(shipment.createdAt) = :date', { date: filters.date });
    }

    queryBuilder
      .orderBy('shipment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  async update(id: number, dto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOneBy({ id });
    if (!shipment) throw new NotFoundException(`Envio con id ${id} no encontrado`);

    if (dto.status) shipment.status = dto.status;
    if (dto.destination) shipment.destination = dto.destination;

    return this.shipmentRepository.save(shipment);
  }

  async remove(id: number): Promise<{ message: string }> {
    const shipment = await this.shipmentRepository.findOneBy({ id });
    if (!shipment) throw new NotFoundException(`Envio con id ${id} no encontrado`);
    await this.shipmentRepository.remove(shipment);
    return { message: `Envio ${shipment.trackingCode} eliminado correctamente` };
  }
}