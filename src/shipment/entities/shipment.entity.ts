import {
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Package } from '../../package/entities/package.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => Package, (packageEntity) => packageEntity.shipment)
  packages!: Package[];
}