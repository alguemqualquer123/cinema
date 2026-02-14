import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  Discount,
  DiscountStatus,
  DiscountType,
} from '../entities/discount.entity';

@Injectable()
export class DescontoService {
  constructor(
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  async createDiscount(data: Partial<Discount>): Promise<Discount> {
    const discount = this.discountRepository.create(data);
    return this.discountRepository.save(discount);
  }

  async findAllDiscounts(): Promise<Discount[]> {
    return this.discountRepository.find();
  }

  async applyDiscount(
    code: string,
    total: number,
  ): Promise<{ amount: number; finalTotal: number }> {
    const discount = await this.discountRepository.findOne({
      where: { code, status: DiscountStatus.ACTIVE },
    });

    if (!discount) {
      throw new NotFoundException('Invalid discount code');
    }

    if (discount.expiresAt && discount.expiresAt < new Date()) {
      throw new BadRequestException('Discount code expired');
    }

    if (discount.currentUses >= discount.maxUses) {
      throw new BadRequestException('Discount code limit reached');
    }

    if (total < discount.minPurchase) {
      throw new BadRequestException(
        `Minimum purchase of ${discount.minPurchase} required`,
      );
    }

    let amount = 0;
    if (discount.type === DiscountType.PERCENTAGE) {
      amount = (total * discount.value) / 100;
    } else {
      amount = discount.value;
    }

    discount.currentUses += 1;
    if (discount.currentUses >= discount.maxUses) {
      discount.status = DiscountStatus.USED;
    }
    await this.discountRepository.save(discount);

    return {
      amount,
      finalTotal: Math.max(0, total - amount),
    };
  }

  async validateDiscount(code: string): Promise<boolean> {
    const discount = await this.discountRepository.findOne({
      where: { code, status: DiscountStatus.ACTIVE },
    });
    return (
      !!discount && (!discount.expiresAt || discount.expiresAt > new Date())
    );
  }
}
