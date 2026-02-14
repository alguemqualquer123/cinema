import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';
import { DescontoService } from './services/desconto.service';
import { DescontoController } from './controllers/desconto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Discount])],
  controllers: [DescontoController],
  providers: [DescontoService],
  exports: [DescontoService],
})
export class DescontoModule {}
