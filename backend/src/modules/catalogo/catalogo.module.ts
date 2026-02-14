import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie, Session } from './entities/movie.entity';
import { Sala } from '../sala/entities/sala.entity';
import { Seat } from '../sala/entities/seat.entity';
import { MovieService, SessionService } from './services/movie.service';
import { CatalogoController } from './controllers/catalogo.controller';
import { SeedService } from './seed.service';
import { SalaModule } from '../sala/sala.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, Session, Sala, Seat]),
    SalaModule,
  ],
  controllers: [CatalogoController],
  providers: [MovieService, SessionService, SeedService],
  exports: [MovieService, SessionService],
})
export class CatalogoModule {}
