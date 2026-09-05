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