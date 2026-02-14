import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Seat } from './seat.entity';
import { Session } from '../../catalogo/entities/session.entity';

export { Seat } from './seat.entity';

@Entity('salas')
export class Sala {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 10 })
  rows: number;

  @Column({ default: 15 })
  seatsPerRow: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  is3D: boolean;

  @Column({ default: false })
  isIMAX: boolean;

  @Column({ default: false })
  hasSoundDolby: boolean;

  @OneToMany(() => Seat, (seat) => seat.sala)
  seats: Seat[];

  @OneToMany(() => Session, (session) => session.sala)
  sessions: Session[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
