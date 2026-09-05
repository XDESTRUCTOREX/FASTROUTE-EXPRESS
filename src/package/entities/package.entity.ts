import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Shipment } from '../../shipment/entities/shipment.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  weight: number;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Shipment, (shipment) => shipment.packages)
  shipment: Shipment;
}
