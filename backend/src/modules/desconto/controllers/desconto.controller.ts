import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DescontoService } from '../services/desconto.service';
import { JwtAuthGuard } from '../../conta/strategies/jwt-auth.guard';
import { RolesGuard } from '../../conta/strategies/roles.guard';
import { Roles } from '../../conta/strategies/roles.decorator';
import { UserRole } from '../../conta/entities/user.entity';
import { Discount, DiscountType } from '../entities/discount.entity';

class CreateDiscountDto {
  code: string;
  description: string;
  type: DiscountType;
  value: number;
  maxUses?: number;
  expiresAt?: Date;
  minPurchase?: number;
}

@Controller('discounts')
export class DescontoController {
  constructor(private readonly descontoService: DescontoService) {}

  @Get()
  findAll() {
    return this.descontoService.findAllDiscounts();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateDiscountDto) {
    return this.descontoService.createDiscount(dto);
  }

  @Get('validate/:code')
  validate(@Param('code') code: string) {
    return this.descontoService.validateDiscount(code);
  }
}
