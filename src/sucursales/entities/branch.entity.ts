import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Shipment } from '../../shipment/entities/shipment.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column({ length: 120 })
  name: string | undefined;

  @Column({ length: 180 })
  address: string | undefined;

  @Column({ length: 80 })
  city: string | undefined;

  @Column({ length: 30, nullable: true })
  phone: string | null | undefined;

  @OneToMany(() => Shipment, (shipment) => shipment.originBranch)
  originShipments: Shipment[] | undefined;

  @OneToMany(() => Shipment, (shipment) => shipment.destinationBranch)
  destinationShipments: Shipment[] | undefined;
}
