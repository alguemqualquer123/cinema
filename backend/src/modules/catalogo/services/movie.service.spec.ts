import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovieService, SessionService } from './movie.service';
import { Movie } from '../entities/movie.entity';
import { Session } from '../entities/session.entity';
import { NotFoundException } from '@nestjs/common';

describe('MovieService', () => {
  let movieService: MovieService;
  let sessionService: SessionService;
  let movieRepository: Repository<Movie>;
  let sessionRepository: Repository<Session>;

  const mockMovieRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSessionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        SessionService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionRepository,
        },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    sessionService = module.get<SessionService>(SessionService);
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    sessionRepository = module.get<Repository<Session>>(getRepositoryToken(Session));

    jest.clearAllMocks();
  });

  describe('MovieService', () => {
    describe('createMovie', () => {
      it('should create a new movie', async () => {
        const movieData = { title: 'Test Movie', description: 'Test Description', duration: 120, genre: 'Action' };
        const createdMovie = { id: '1', ...movieData };
        
        mockMovieRepository.create.mockReturnValue(createdMovie);
        mockMovieRepository.save.mockResolvedValue(createdMovie);

        const result = await movieService.createMovie(movieData);

        expect(mockMovieRepository.create).toHaveBeenCalledWith(movieData);
        expect(mockMovieRepository.save).toHaveBeenCalled();
        expect(result).toEqual(createdMovie);
      });
    });

    describe('findAllMovies', () => {
      it('should return all active and showing movies', async () => {
        const movies = [
          { id: '1', title: 'Movie 1', isActive: true, showing: true },
          { id: '2', title: 'Movie 2', isActive: true, showing: true },
        ];
        
        mockMovieRepository.find.mockResolvedValue(movies);

        const result = await movieService.findAllMovies();

        expect(mockMovieRepository.find).toHaveBeenCalledWith({ where: { isActive: true, showing: true } });
        expect(result).toEqual(movies);
      });
    });

    describe('findMovieById', () => {
      it('should return a movie by id', async () => {
        const movie = { id: '1', title: 'Test Movie', sessions: [] };
        
        mockMovieRepository.findOne.mockResolvedValue(movie);

        const result = await movieService.findMovieById('1');

        expect(result).toEqual(movie);
      });

      it('should throw NotFoundException if movie not found', async () => {
        mockMovieRepository.findOne.mockResolvedValue(null);

        await expect(movieService.findMovieById('999')).rejects.toThrow(NotFoundException);
      });
    });

    describe('getNowShowing', () => {
      it('should return movies currently showing', async () => {
        const movies = [
          { id: '1', title: 'Movie 1', isActive: true, showing: true },
        ];
        
        mockMovieRepository.find.mockResolvedValue(movies);

        const result = await movieService.getNowShowing();

        expect(mockMovieRepository.find).toHaveBeenCalled();
        expect(result).toEqual(movies);
      });
    });
  });

  describe('SessionService', () => {
    describe('createSession', () => {
      it('should create a new session', async () => {
        const sessionData = { movieId: '1', salaId: '1', startTime: new Date(), endTime: new Date(), price: 30 };
        const createdSession = { id: '1', ...sessionData };
        
        mockSessionRepository.create.mockReturnValue(createdSession);
        mockSessionRepository.save.mockResolvedValue(createdSession);

        const result = await sessionService.createSession(sessionData);

        expect(mockSessionRepository.create).toHaveBeenCalledWith(sessionData);
        expect(result).toEqual(createdSession);
      });
    });

    describe('findAllSessions', () => {
      it('should return all active sessions', async () => {
        const sessions = [
          { id: '1', movieId: '1', salaId: '1', isActive: true },
        ];
        
        mockSessionRepository.find.mockResolvedValue(sessions);

        const result = await sessionService.findAllSessions();

        expect(mockSessionRepository.find).toHaveBeenCalled();
        expect(result).toEqual(sessions);
      });
    });

    describe('findSessionById', () => {
      it('should return a session by id', async () => {
        const session = { id: '1', movieId: '1', salaId: '1' };
        
        mockSessionRepository.findOne.mockResolvedValue(session);

        const result = await sessionService.findSessionById('1');

        expect(result).toEqual(session);
      });

      it('should throw NotFoundException if session not found', async () => {
        mockSessionRepository.findOne.mockResolvedValue(null);

        await expect(sessionService.findSessionById('999')).rejects.toThrow(NotFoundException);
      });
    });

    describe('findSessionsByMovie', () => {
      it('should return sessions for a specific movie', async () => {
        const sessions = [
          { id: '1', movieId: '1', salaId: '1', isActive: true },
        ];
        
        mockSessionRepository.find.mockResolvedValue(sessions);

        const result = await sessionService.findSessionsByMovie('1');

        expect(mockSessionRepository.find).toHaveBeenCalled();
        expect(result).toEqual(sessions);
      });
    });
  });
});
