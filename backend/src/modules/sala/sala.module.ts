import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sala, Seat } from './entities/sala.entity';
import { SalaService } from './services/sala.service';
import { SalaController } from './controllers/sala.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sala, Seat])],
  controllers: [SalaController],
  providers: [SalaService],
  exports: [SalaService],
})
export class SalaModule {}
