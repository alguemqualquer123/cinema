import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../entities/ticket.entity';
import { EventBusService } from '../../../common/events/event-bus.service';

@Injectable()
export class IngressoService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private eventBus: EventBusService,
  ) { }

  async findTicketById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['order', 'order.session', 'order.session.movie'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async findTicketByQRCode(qrCode: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { qrCode },
      relations: [
        'order',
        'order.session',
        'order.session.movie',
        'order.user',
      ],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async findUserTickets(userId: string): Promise<Ticket[]> {
    return this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.order', 'order')
      .where('order.userId = :userId', { userId })
      .leftJoinAndSelect('ticket.order', 'order2')
      .leftJoinAndSelect('order.session', 'session')
      .leftJoinAndSelect('session.movie', 'movie')
      .orderBy('ticket.createdAt', 'DESC')
      .getMany();
  }

  async validateTicket(
    qrCode: string,
  ): Promise<{ valid: boolean; message: string; ticket?: Ticket }> {
    try {
      const ticket = await this.findTicketByQRCode(qrCode);

      if (ticket.status === TicketStatus.USED) {
        return { valid: false, message: 'Ticket already used', ticket };
      }

      if (ticket.status === TicketStatus.CANCELLED) {
        return { valid: false, message: 'Ticket cancelled', ticket };
      }

      ticket.status = TicketStatus.USED;
      ticket.validatedAt = new Date();
      await this.ticketRepository.save(ticket);

      await this.eventBus.publish('TicketValidated', {
        ticketId: ticket.id,
        qrCode,
        orderId: ticket.orderId,
      });

      return { valid: true, message: 'Ticket validated successfully', ticket };
    } catch (error) {
      return { valid: false, message: 'Invalid ticket' };
    }
  }

  async cancelTicket(id: string): Promise<Ticket> {
    const ticket = await this.findTicketById(id);
    ticket.status = TicketStatus.CANCELLED;
    return this.ticketRepository.save(ticket);
  }
}
