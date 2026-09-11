import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('packages')
export class Package {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 200 })
  description!: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  weight!: number;

}