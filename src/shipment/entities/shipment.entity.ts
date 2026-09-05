import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from '../../sucursales/entities/branch.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column({ length: 120 })
  clientName: string | undefined;

  @Column({ length: 30, default: 'registered' })
  status: string | undefined;

  @CreateDateColumn()
  createdAt: Date | undefined;

  @ManyToOne(() => Branch, (branch) => branch.originShipments, {
    nullable: false,
  })
  @JoinColumn({ name: 'origin_branch_id' })
  originBranch: Branch | undefined;

  @ManyToOne(() => Branch, (branch) => branch.destinationShipments, {
    nullable: false,
  })
  @JoinColumn({ name: 'destination_branch_id' })
  destinationBranch: Branch | undefined;
}
