# EJECUTAR DENTRO DE LA CARPETA DEL PROYECTO (donde esta package.json):
# powershell -ExecutionPolicy Bypass -File .\instalar-fastroute.ps1

 $ErrorActionPreference = "Stop"

if (-not (Test-Path (Join-Path (Get-Location) "package.json"))) {
    Write-Error "ERROR: Ejecuta este script DENTRO de la carpeta del proyecto (donde esta package.json)"
    exit 1
}

function Add-File {
    param([string]$Path, [string]$Content)
    $full = Join-Path (Get-Location) $Path
    $dir = Split-Path $full -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($full, $Content, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "  + $Path"
}

Write-Host "Proyecto: $(Split-Path (Get-Location) -Leaf)"
Write-Host "1/4 Eliminando archivos por defecto de NestJS..." -ForegroundColor Cyan

"src/app.controller.ts", "src/app.service.ts", "src/app.controller.spec.ts", "test/app.e2e-spec.ts" | ForEach-Object {
    $p = Join-Path (Get-Location) $_
    if (Test-Path $p) { Remove-Item $p -Force; Write-Host "  - $_ (eliminado)" }
}

Write-Host "2/4 Creando archivos de configuracion..." -ForegroundColor Cyan

Add-File ".env" @'
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=TU_CONTRASENA_MYSQL
DB_DATABASE=fastroute_express
DB_SYNCHRONIZE=true
PORT=3000
'@

Add-File ".env.example" @'
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=TU_CONTRASENA_MYSQL
DB_DATABASE=fastroute_express
DB_SYNCHRONIZE=true
PORT=3000
'@

Add-File "src/main.ts" @'
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe global: valida todos los DTOs en toda la app
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`FastRoute Express corriendo en: http://localhost:${port}`);
}
bootstrap();
'@

Add-File "src/app.module.ts" @'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesModule } from './branches/branches.module';
import { DriversModule } from './drivers/drivers.module';
import { CustomersModule } from './customers/customers.module';
import { PackagesModule } from './packages/packages.module';
import { ShipmentsModule } from './shipments/shipments.module';

@Module({
  imports: [
    // Conexion a MySQL con variables de entorno (.env)
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
    }),
    BranchesModule,
    DriversModule,
    CustomersModule,
    PackagesModule,
    ShipmentsModule,
  ],
})
export class AppModule {}
'@

Write-Host "3/4 Creando modulos del proyecto..." -ForegroundColor Cyan

# ===== INTEGRANTE 1: DARNELLI - Sucursales =====

Add-File "src/branches/branch.entity.ts" @'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Shipment } from '../shipments/shipment.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @OneToMany(() => Shipment, (shipment) => shipment.originBranch)
  shipments: Shipment[];
}
'@

Add-File "src/branches/dto/create-branch.dto.ts" @'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
'@

Add-File "src/branches/dto/update-branch.dto.ts" @'
import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchDto } from './create-branch.dto';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
'@

Add-File "src/branches/branches.service.ts" @'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  create(dto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepository.create(dto);
    return this.branchRepository.save(branch);
  }

  findAll(): Promise<Branch[]> {
    return this.branchRepository.find();
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOneBy({ id });
    if (!branch) {
      throw new NotFoundException(`Sucursal con id ${id} no encontrada`);
    }
    return branch;
  }

  async update(id: number, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    Object.assign(branch, dto);
    return this.branchRepository.save(branch);
  }

  async remove(id: number): Promise<{ message: string }> {
    const branch = await this.findOne(id);
    try {
      await this.branchRepository.remove(branch);
      return { message: `Sucursal "${branch.name}" eliminada correctamente` };
    } catch {
      throw new ConflictException('No se puede eliminar: la sucursal tiene envios asociados');
    }
  }
}
'@

Add-File "src/branches/branches.controller.ts" @'
import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Get()
  findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBranchDto) {
    return this.branchesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.remove(id);
  }
}
'@

Add-File "src/branches/branches.module.ts" @'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './branch.entity';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';

@Module({
  imports: [TypeOrmModule.forFeature([Branch])],
  controllers: [BranchesController],
  providers: [BranchesService],
})
export class BranchesModule {}
'@

# ===== INTEGRANTE 2: EDUARDO - Conductores y Clientes =====

Add-File "src/drivers/driver.entity.ts" @'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Shipment } from '../shipments/shipment.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  license: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @OneToMany(() => Shipment, (shipment) => shipment.driver)
  shipments: Shipment[];
}
'@

Add-File "src/customers/customer.entity.ts" @'
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Shipment } from '../shipments/shipment.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @OneToMany(() => Shipment, (shipment) => shipment.customer)
  shipments: Shipment[];
}
'@

Add-File "src/drivers/dto/create-driver.dto.ts" @'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDriverDto {
  // Sanitizacion: quita espacios sobrantes
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  license: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
'@

Add-File "src/drivers/dto/update-driver.dto.ts" @'
import { PartialType } from '@nestjs/mapped-types';
import { CreateDriverDto } from './create-driver.dto';

export class UpdateDriverDto extends PartialType(CreateDriverDto) {}
'@

Add-File "src/customers/dto/create-customer.dto.ts" @'
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCustomerDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  // Sanitizacion: quita espacios y pasa a minusculas antes de validar
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Debe proporcionar un email valido' })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
'@

Add-File "src/customers/dto/update-customer.dto.ts" @'
import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
'@

Add-File "src/drivers/drivers.service.ts" @'
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
'@

Add-File "src/customers/customers.service.ts" @'
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
'@

Add-File "src/drivers/drivers.controller.ts" @'
import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  create(@Body() dto: CreateDriverDto) {
    return this.driversService.create(dto);
  }

  @Get()
  findAll() {
    return this.driversService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDriverDto) {
    return this.driversService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.remove(id);
  }
}
'@

Add-File "src/customers/customers.controller.ts" @'
import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }
}
'@

Add-File "src/drivers/drivers.module.ts" @'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './driver.entity';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Driver])],
  controllers: [DriversController],
  providers: [DriversService],
})
export class DriversModule {}
'@

Add-File "src/customers/customers.module.ts" @'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
'@

# ===== INTEGRANTE 3: EIVER - Paquetes y Tarifas =====

Add-File "src/packages/package.entity.ts" @'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Shipment } from '../shipments/shipment.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  description: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  weight: number;

  @ManyToOne(() => Shipment, (shipment) => shipment.packages)
  @JoinColumn({ name: 'shipment_id', onDelete: 'CASCADE' })
  shipment: Shipment;
}
'@

Add-File "src/packages/dto/create-package.dto.ts" @'
import { IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  // @Type convierte a numero el valor que llega por JSON
  @Type(() => Number)
  @IsPositive({ message: 'El peso debe ser un numero positivo' })
  weight: number;
}
'@

Add-File "src/packages/packages.service.ts" @'
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
'@

Add-File "src/packages/packages.module.ts" @'
import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Module({
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
'@

# ===== INTEGRANTE 4: SANTIAGO + 5: ANDRES - Envios =====

Add-File "src/shipments/shipment.entity.ts" @'
import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Driver } from '../drivers/driver.entity';
import { Branch } from '../branches/branch.entity';
import { Package } from '../packages/package.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  trackingCode: string;

  @Column({ type: 'varchar', length: 200 })
  destination: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalCost: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // ManyToOne: cada envio pertenece a un cliente, un conductor y una sucursal
  @ManyToOne(() => Customer, (customer) => customer.shipments)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Driver, (driver) => driver.shipments)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @ManyToOne(() => Branch, (branch) => branch.shipments)
  @JoinColumn({ name: 'origin_branch_id' })
  originBranch: Branch;

  // OneToMany: cascade guarda los paquetes junto con el envio en un solo JSON
  @OneToMany(() => Package, (pkg) => pkg.shipment, { cascade: true })
  packages: Package[];
}
'@

Add-File "src/shipments/dto/create-shipment.dto.ts" @'
import {
  ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePackageDto } from '../../packages/dto/create-package.dto';

export class CreateShipmentDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  customerId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  driverId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  originBranchId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  destination: string;

  // Permite enviar el envio con sus paquetes en un solo JSON
  @IsArray()
  @ArrayMinSize(1, { message: 'El envio debe tener al menos un paquete' })
  @ValidateNested({ each: true })
  @Type(() => CreatePackageDto)
  packages: CreatePackageDto[];
}
'@

Add-File "src/shipments/dto/update-shipment.dto.ts" @'
import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateShipmentDto } from './create-shipment.dto';

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {
  @IsOptional()
  @IsIn(['PENDIENTE', 'EN_TRANSITO', 'ENTREGADO'])
  status?: string;
}
'@

Add-File "src/shipments/shipments.service.ts" @'
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
      relations: ['customer', 'driver', 'originBranch', 'packages'],
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
'@

Add-File "src/shipments/shipments.controller.ts" @'
import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentsService.create(dto);
  }

  // Ejemplo: /shipments?page=1&limit=10&customerId=1&branchId=2&date=2025-05-10
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customerId') customerId?: string,
    @Query('branchId') branchId?: string,
    @Query('date') date?: string,
  ) {
    return this.shipmentsService.findAllPaginated(
      Number(page) || 1,
      Number(limit) || 10,
      {
        customerId: customerId ? Number(customerId) : undefined,
        branchId: branchId ? Number(branchId) : undefined,
        date: date || undefined,
      },
    );
  }

  @Get(':id/detail')
  findDetail(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.findDetail(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShipmentDto) {
    return this.shipmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.remove(id);
  }
}
'@

Add-File "src/shipments/shipments.module.ts" @'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from './shipment.entity';
import { Customer } from '../customers/customer.entity';
import { Driver } from '../drivers/driver.entity';
import { Branch } from '../branches/branch.entity';
import { PackagesModule } from '../packages/packages.module';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, Customer, Driver, Branch]),
    PackagesModule,
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
})
export class ShipmentsModule {}
'@

Write-Host "4/4 Instalando dependencias (esto tarda un poco)..." -ForegroundColor Cyan
npm install @nestjs/typeorm typeorm mysql2 class-validator class-transformer dotenv @nestjs/mapped-types

Write-Host ""
Write-Host "LISTO. Ahora solo falta:" -ForegroundColor Green
Write-Host "  1. Abre .env y pon tu contrasena real de MySQL en DB_PASSWORD"
Write-Host "  2. Crea la base de datos:  CREATE DATABASE fastroute_express;"
Write-Host "  3. npm run start:dev"