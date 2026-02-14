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
import { User } from '../../conta/entities/user.entity';
import { Session } from '../../catalogo/entities/session.entity';
import { Ticket } from '../../ingresso/entities/ticket.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ nullable: true })
  discountCode: string;

  @Column({ default: 0 })
  discountAmount: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Session, (session) => session.orders)
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  @Column()
  sessionId: string;

  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets: Ticket[];

  @Column('simple-array')
  seatIds: string[];

  @Column({ type: 'json', nullable: true })
  productItems: {
    id: string;
    type: 'product' | 'package';
    quantity: number;
    price: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
