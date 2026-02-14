import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { IngressoService } from './services/ingresso.service';
import { IngressoController } from './controllers/ingresso.controller';
import { EventBusModule } from '../../common/events/event-bus.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), EventBusModule],
  controllers: [IngressoController],
  providers: [IngressoService],
  exports: [IngressoService],
})
export class IngressoModule {}
