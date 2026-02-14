import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../../ingresso/entities/ticket.entity';

@Injectable()
export class ValidacaoService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  async validateQRCode(qrCode: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    const ticket = await this.ticketRepository.findOne({
      where: { qrCode },
      relations: [
        'order',
        'order.session',
        'order.session.movie',
        'order.user',
      ],
    });

    if (!ticket) {
      return { success: false, message: 'Invalid QR Code - Ticket not found' };
    }

    if (ticket.status === TicketStatus.USED) {
      return {
        success: false,
        message: 'Ticket already used',
        data: {
          ticketId: ticket.id,
          seatInfo: ticket.seatInfo,
          validatedAt: ticket.validatedAt,
          movie: ticket.order?.session?.movie?.title,
        },
      };
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      return { success: false, message: 'Ticket is cancelled' };
    }

    ticket.status = TicketStatus.USED;
    ticket.validatedAt = new Date();
    await this.ticketRepository.save(ticket);

    return {
      success: true,
      message: 'Access granted',
      data: {
        ticketId: ticket.id,
        seatInfo: ticket.seatInfo,
        movie: ticket.order?.session?.movie?.title,
        sessionTime: ticket.order?.session?.startTime,
        validatedAt: ticket.validatedAt,
      },
    };
  }

  async getValidationStats(): Promise<any> {
    const total = await this.ticketRepository.count();
    const used = await this.ticketRepository.count({
      where: { status: TicketStatus.USED },
    });
    const valid = await this.ticketRepository.count({
      where: { status: TicketStatus.VALID },
    });
    const cancelled = await this.ticketRepository.count({
      where: { status: TicketStatus.CANCELLED },
    });

    return { total, used, valid, cancelled };
  }
}
