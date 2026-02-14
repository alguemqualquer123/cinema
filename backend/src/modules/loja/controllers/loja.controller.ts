import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LojaService } from '../services/loja.service';
import { CreateOrderDto } from '../dto/order.dto';
import { JwtAuthGuard } from '../../conta/strategies/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class LojaController {
  constructor(private readonly lojaService: LojaService) { }

  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.lojaService.createOrder(req.user.id, createOrderDto);
  }

  @Get('my-orders')
  findMyOrders(@Request() req) {
    return this.lojaService.findUserOrders(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lojaService.findOrderById(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.lojaService.cancelOrder(id);
  }
}
