import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../loja/entities/order.entity';

export enum VoucherStatus {
  VALID = 'valid',
  USED = 'used',
  CANCELLED = 'cancelled',
}

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  qrCode: string;

  @Column({ type: 'enum', enum: VoucherStatus, default: VoucherStatus.VALID })
  status: VoucherStatus;

  @Column()
  price: number;

  @Column()
  itemName: string;

  @Column()
  itemId: string;

  @Column({ default: 1 })
  quantity: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @Column({ nullable: true })
  validatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
