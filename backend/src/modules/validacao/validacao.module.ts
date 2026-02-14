import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from '../ingresso/entities/ticket.entity';
import { ValidacaoService } from './services/validacao.service';
import { ValidacaoController } from './controllers/validacao.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [ValidacaoController],
  providers: [ValidacaoService],
  exports: [ValidacaoService],
})
export class ValidacaoModule {}
