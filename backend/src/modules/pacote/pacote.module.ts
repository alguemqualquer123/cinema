import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, Package } from './entities/product.entity';
import { Voucher } from './entities/voucher.entity';
import { PacoteService } from './services/pacote.service';
import { PacoteController } from './controllers/pacote.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Package, Voucher])],
  controllers: [PacoteController],
  providers: [PacoteService],
  exports: [PacoteService],
})
export class PacoteModule {}
