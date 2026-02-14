import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @IsString({ each: true })
  seatIds: string[];

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsString()
  discountCode?: string;

  @IsOptional()
  @IsArray()
  products?: { id: string; type: 'product' | 'package'; quantity: number }[];
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  paymentId?: string;
}

export class ApplyDiscountDto {
  @IsString()
  code: string;

  @IsNumber()
  total: number;
}
