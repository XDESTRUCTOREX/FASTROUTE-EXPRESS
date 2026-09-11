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