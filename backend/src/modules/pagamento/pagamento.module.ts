import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../loja/entities/order.entity';
import { Ticket } from '../ingresso/entities/ticket.entity';
import { PagamentoService } from './services/pagamento.service';
import { PagamentoController } from './controllers/pagamento.controller';
import { SalaModule } from '../sala/sala.module';
import { PacoteModule } from '../pacote/pacote.module';
import { Voucher } from '../pacote/entities/voucher.entity';
import { EventBusModule } from '../../common/events/event-bus.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Ticket, Voucher]),
    SalaModule,
    PacoteModule,
    EventBusModule,
  ],
  controllers: [PagamentoController],
  providers: [PagamentoService],
  exports: [PagamentoService],
})
export class PagamentoModule {}
