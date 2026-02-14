import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../loja/entities/order.entity';
import { Ticket, TicketStatus } from '../../ingresso/entities/ticket.entity';
import { Voucher, VoucherStatus } from '../../pacote/entities/voucher.entity';
import { SalaService } from '../../sala/services/sala.service';
import { EventBusService } from '../../../common/events/event-bus.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PagamentoService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    private salaService: SalaService,
    private eventBus: EventBusService,
  ) { }

  async createPaymentIntent(
    orderId: string,
  ): Promise<{ clientSecret: string; paymentId: string }> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not pending');
    }

    const paymentId = `pi_${uuidv4()}`;
    const clientSecret = `${paymentId}_secret_${uuidv4().substring(0, 8)}`;

    return { clientSecret, paymentId };
  }

  async handleWebhook(
    payload: any,
  ): Promise<{ success: boolean; orderId?: string }> {
    const { paymentId, status, orderId } = payload;

    if (status === 'approved' || status === 'succeeded') {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });
      if (!order) throw new NotFoundException('Order not found');

      order.status = OrderStatus.PAID;
      order.paymentId = paymentId;
      await this.orderRepository.save(order);

      await this.salaService.occupySeats(order.seatIds);

      const tickets = await this.generateTickets(order);
      const vouchers = await this.generateVouchers(order);

      await this.eventBus.publish('PaymentApproved', {
        orderId: order.id,
        paymentId,
        tickets: tickets.map((t) => t.id),
        vouchers: vouchers.map((v) => v.id),
      });

      return { success: true, orderId: order.id };
    }

    if (status === 'failed') {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });
      if (order) {
        await this.salaService.releaseSeats(order.seatIds);
        order.status = OrderStatus.CANCELLED;
        await this.orderRepository.save(order);
      }
      await this.eventBus.publish('PaymentFailed', { orderId, paymentId });
    }

    return { success: false };
  }

  private async generateTickets(order: Order): Promise<Ticket[]> {
    const tickets: Ticket[] = [];

    for (const seatId of order.seatIds) {
      const seat = await this.salaService.getSeatsBySala(order.sessionId);
      const seatData = seat.find((s) => s.id === seatId);

      if (seatData) {
        const ticket = this.ticketRepository.create({
          orderId: order.id,
          seatId,
          seatInfo: `${seatData.row}${seatData.number}`,
          qrCode: this.generateQRCode(),
          price: seatData.price,
          status: TicketStatus.VALID,
        });
        tickets.push(ticket);
      }
    }

    return this.ticketRepository.save(tickets);
  }

  private generateQRCode(): string {
    return `TICKET-${uuidv4()}-${Date.now()}`;
  }

  async confirmPayment(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.PAID;
    return this.orderRepository.save(order);
  }

  private async generateVouchers(order: Order): Promise<Voucher[]> {
    if (!order.productItems || order.productItems.length === 0) return [];

    const vouchers: Voucher[] = [];
    for (const item of order.productItems) {
      const voucher = this.voucherRepository.create({
        orderId: order.id,
        itemId: item.id,
        itemName: `${item.type.toUpperCase()}-${item.id}`,
        price: item.price,
        quantity: item.quantity,
        qrCode: `VOUCHER-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        status: VoucherStatus.VALID,
      });
      vouchers.push(voucher);
    }

    return this.voucherRepository.save(vouchers);
  }
}
