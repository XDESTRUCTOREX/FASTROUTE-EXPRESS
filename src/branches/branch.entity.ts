import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Shipment } from '../shipments/shipment.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 200 })
  address!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @OneToMany(() => Shipment, (shipment) => shipment.branch)
  shipments!: Shipment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
