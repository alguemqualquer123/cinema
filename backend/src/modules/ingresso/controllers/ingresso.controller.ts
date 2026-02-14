import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IngressoService } from '../services/ingresso.service';
import { JwtAuthGuard } from '../../conta/strategies/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class IngressoController {
  constructor(private readonly ingressoService: IngressoService) { }

  @Get('my-tickets')
  findMyTickets(@Request() req) {
    return this.ingressoService.findUserTickets(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingressoService.findTicketById(id);
  }

  @Get('qr/:qrCode')
  findByQRCode(@Param('qrCode') qrCode: string) {
    return this.ingressoService.findTicketByQRCode(qrCode);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ingressoService.cancelTicket(id);
  }
}
