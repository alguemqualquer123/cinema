import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { LojaService } from './services/loja.service';
import { LojaController } from './controllers/loja.controller';
import { SalaModule } from '../sala/sala.module';
import { CatalogoModule } from '../catalogo/catalogo.module';
import { DescontoModule } from '../desconto/desconto.module';
import { PacoteModule } from '../pacote/pacote.module';
import { EventBusModule } from '../../common/events/event-bus.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    SalaModule,
    CatalogoModule,
    DescontoModule,
    PacoteModule,
    EventBusModule,
  ],
  controllers: [LojaController],
  providers: [LojaService],
  exports: [LojaService],
})
export class LojaModule {}
