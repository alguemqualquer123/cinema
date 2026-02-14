import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { PagamentoService } from '../services/pagamento.service';
import { JwtAuthGuard } from '../../conta/strategies/jwt-auth.guard';

@Controller('payments')
export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoService) { }

  @Post('create-intent/:orderId')
  @UseGuards(JwtAuthGuard)
  createPaymentIntent(@Param('orderId') orderId: string) {
    return this.pagamentoService.createPaymentIntent(orderId);
  }

  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    return this.pagamentoService.handleWebhook(payload);
  }

  @Post('confirm/:orderId')
  @UseGuards(JwtAuthGuard)
  confirmPayment(@Param('orderId') orderId: string) {
    return this.pagamentoService.confirmPayment(orderId);
  }
}
