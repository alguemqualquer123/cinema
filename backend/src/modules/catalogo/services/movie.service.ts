import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { Session } from '../entities/session.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) { }

  async createMovie(movieData: Partial<Movie>): Promise<Movie> {
    const movie = this.movieRepository.create(movieData);
    return this.movieRepository.save(movie);
  }

  async findAllMovies(): Promise<Movie[]> {
    return this.movieRepository.find({ where: { isActive: true, showing: true } });
  }

  async findMovieById(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['sessions', 'sessions.sala'],
    });
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }

  async getNowShowing(): Promise<Movie[]> {
    return this.movieRepository.find({
      where: { isActive: true, showing: true },
      order: { releaseDate: 'DESC' },
      take: 20,
    });
  }
}

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) { }

  async createSession(sessionData: Partial<Session>): Promise<Session> {
    const session = this.sessionRepository.create(sessionData);
    return this.sessionRepository.save(session);
  }

  async findAllSessions(): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { isActive: true },
      relations: ['movie', 'sala'],
      order: { startTime: 'ASC' },
    });
  }

  async findSessionById(id: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['movie', 'sala'],
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async findSessionsByMovie(movieId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { movieId, isActive: true },
      relations: ['sala'],
      order: { startTime: 'ASC' },
    });
  }

  async findUpcomingSessions(): Promise<Session[]> {
    const now = new Date();
    return this.sessionRepository.find({
      where: { startTime: MoreThan(now), isActive: true },
      relations: ['movie', 'sala'],
      order: { startTime: 'ASC' },
      take: 20,
    });
  }
}
