import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Movie } from './movie.entity';
import { Sala } from '../../sala/entities/sala.entity';
import { Order } from '../../loja/entities/order.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ default: 0 })
  price: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Movie, (movie) => movie.sessions)
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @Column()
  movieId: string;

  @ManyToOne(() => Sala, (sala) => sala.sessions)
  @JoinColumn({ name: 'salaId' })
  sala: Sala;

  @Column()
  salaId: string;

  @OneToMany(() => Order, (order) => order.session)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
