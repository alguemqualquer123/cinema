import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sala } from './sala.entity';

export enum SeatType {
  STANDARD = 'standard',
  PREFERENTIAL = 'preferential',
  ACCESSIBLE = 'accessible',
  VIP = 'vip',
}

export enum SeatStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  OCCUPIED = 'occupied',
  BLOCKED = 'blocked',
}

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  row: string;

  @Column()
  number: number;

  @Column({ type: 'enum', enum: SeatType, default: SeatType.STANDARD })
  type: SeatType;

  @Column({ type: 'enum', enum: SeatStatus, default: SeatStatus.AVAILABLE })
  status: SeatStatus;

  @Column({ default: 0 })
  price: number;

  @Column({ default: false })
  isForDisability: boolean;

  @Column({ default: false })
  isForElderly: boolean;

  @Column({ default: false })
  isForPregnant: boolean;

  @ManyToOne(() => Sala, (sala) => sala.seats)
  @JoinColumn({ name: 'salaId' })
  sala: Sala;

  @Column()
  salaId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
