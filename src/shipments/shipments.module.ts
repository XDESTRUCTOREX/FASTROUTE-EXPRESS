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