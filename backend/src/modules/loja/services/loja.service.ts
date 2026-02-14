import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { SalaService } from '../../sala/services/sala.service';
import { SessionService } from '../../catalogo/services/movie.service';
import { DescontoService } from '../../desconto/services/desconto.service';
import { EventBusService } from '../../../common/events/event-bus.service';
import { PacoteService } from '../../pacote/services/pacote.service';
import { CreateOrderDto } from '../dto/order.dto';


@Injectable()
export class LojaService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private salaService: SalaService,
    private sessionService: SessionService,
    private descontoService: DescontoService,
    private pacoteService: PacoteService,
    private eventBus: EventBusService,
  ) { }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    const session = await this.sessionService.findSessionById(dto.sessionId);
    if (!session) throw new NotFoundException('Session not found');

    const seats = await this.salaService.reserveSeats(
      dto.seatIds,
      dto.sessionId,
    );
    if (!seats.length) throw new BadRequestException('No seats available');

    let total = seats.reduce((sum, seat) => sum + Number(seat.price), 0);
    let discountAmount = 0;
    let discountCode: string | undefined;

    if (dto.discountCode) {
      const discount = await this.descontoService.applyDiscount(
        dto.discountCode,
        total,
      );
      discountAmount = discount.amount;
      total = discount.finalTotal;
      discountCode = dto.discountCode;
    }

    const productItems: {
      id: string;
      type: 'product' | 'package';
      quantity: number;
      price: number;
    }[] = [];
    if (dto.products) {
      for (const item of dto.products) {
        let price = 0;
        if (item.type === 'product') {
          const p = await this.pacoteService.findProductById(item.id);
          price = p.price;
        } else {
          const pkg = await this.pacoteService.findPackageById(item.id);
          price = pkg.price;
        }
        total += Number(price) * item.quantity;
        productItems.push({ ...item, price });
      }
    }

    const order = this.orderRepository.create({
      userId,
      sessionId: dto.sessionId,
      seatIds: dto.seatIds,
      total,
      discountAmount,
      discountCode,
      productItems: productItems,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    await this.eventBus.publish('OrderCreated', {
      orderId: savedOrder.id,
      userId,
      seatIds: dto.seatIds,
      total,
    });

    return savedOrder;
  }

  async findOrderById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['tickets', 'session', 'session.movie'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['tickets', 'session', 'session.movie'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    paymentId?: string,
  ): Promise<Order> {
    const order = await this.findOrderById(id);
    order.status = status;
    if (paymentId) order.paymentId = paymentId;
    return this.orderRepository.save(order);
  }

  async cancelOrder(id: string): Promise<Order> {
    const order = await this.findOrderById(id);
    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Cannot cancel paid order');
    }
    await this.salaService.releaseSeats(order.seatIds);
    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }
}
