/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MovieService, SessionService } from '../services/movie.service';
import { SalaService } from '../../sala/services/sala.service';
import { SeatStatus } from '../../sala/entities/seat.entity';
import { JwtAuthGuard } from '../../conta/strategies/jwt-auth.guard';
import { RolesGuard } from '../../conta/strategies/roles.guard';
import { Roles } from '../../conta/strategies/roles.decorator';
import { UserRole } from '../../conta/entities/user.entity';

class CreateMovieDto {
  title: string;
  description: string;
  duration: number;
  genre: string;
  posterUrl?: string;
  trailerUrl?: string;
}

class CreateSessionDto {
  movieId: string;
  salaId: string;
  startTime: Date;
  endTime: Date;
  price?: number;
}

@Controller('catalog')
export class CatalogoController {
  constructor(
    private readonly movieService: MovieService,
    private readonly sessionService: SessionService,
    private readonly salaService: SalaService,
  ) { }

  @Get('movies')
  findAllMovies() {
    return this.movieService.findAllMovies();
  }

  @Get('movies/now-showing')
  getNowShowing() {
    return this.movieService.getNowShowing();
  }

  @Get('movies/:id')
  findMovie(@Param('id') id: string) {
    return this.movieService.findMovieById(id);
  }

  @Post('movies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createMovie(@Body() dto: CreateMovieDto) {
    return this.movieService.createMovie(dto);
  }

  @Get('sessions')
  findAllSessions() {
    return this.sessionService.findAllSessions();
  }

  @Get('sessions/upcoming')
  findUpcomingSessions() {
    return this.sessionService.findUpcomingSessions();
  }

  @Get('sessions/movie/:movieId')
  findSessionsByMovie(@Param('movieId') movieId: string) {
    return this.sessionService.findSessionsByMovie(movieId);
  }

  @Get('sessions/:id')
  findSession(@Param('id') id: string) {
    return this.sessionService.findSessionById(id);
  }

  @Get('sessions/:id/seats')
  async getSessionSeats(@Param('id') id: string) {
    const session = await this.sessionService.findSessionById(id);
    const seats = await this.salaService.getSeatsBySala(session.salaId);
    const seatsWithAvailability = seats.map(seat => ({
      ...seat,
      isAvailable: seat.status === SeatStatus.AVAILABLE,
    }));
    return { session, seats: seatsWithAvailability };
  }

  @Post('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createSession(@Body() dto: CreateSessionDto) {
    return this.sessionService.createSession(dto);
  }
}
