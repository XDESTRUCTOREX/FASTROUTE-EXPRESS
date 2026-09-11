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

  // En TypeORM moderno, onDelete va en las opciones del @ManyToOne (no en @JoinColumn)
  @ManyToOne(() => Shipment, (shipment) => shipment.packages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;
}