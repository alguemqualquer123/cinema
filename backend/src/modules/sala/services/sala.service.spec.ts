import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalaService } from './sala.service';
import { Sala } from '../entities/sala.entity';
import { Seat, SeatStatus, SeatType } from '../entities/seat.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('SalaService', () => {
  let service: SalaService;
  let salaRepository: Repository<Sala>;
  let seatRepository: Repository<Seat>;

  const mockSalaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSeatRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalaService,
        {
          provide: getRepositoryToken(Sala),
          useValue: mockSalaRepository,
        },
        {
          provide: getRepositoryToken(Seat),
          useValue: mockSeatRepository,
        },
      ],
    }).compile();

    service = module.get<SalaService>(SalaService);
    salaRepository = module.get<Repository<Sala>>(getRepositoryToken(Sala));
    seatRepository = module.get<Repository<Seat>>(getRepositoryToken(Seat));

    jest.clearAllMocks();
  });

  describe('createSala', () => {
    it('should create a new sala', async () => {
      const salaData = { name: 'Sala 1', rows: 10, seatsPerRow: 15 };
      const createdSala = { id: '1', ...salaData };
      
      mockSalaRepository.create.mockReturnValue(createdSala);
      mockSalaRepository.save.mockResolvedValue(createdSala);

      const result = await service.createSala(salaData);

      expect(mockSalaRepository.create).toHaveBeenCalledWith(salaData);
      expect(result).toEqual(createdSala);
    });
  });

  describe('findAllSalas', () => {
    it('should return all active salas', async () => {
      const salas = [
        { id: '1', name: 'Sala 1', isActive: true },
        { id: '2', name: 'Sala 2', isActive: true },
      ];
      
      mockSalaRepository.find.mockResolvedValue(salas);

      const result = await service.findAllSalas();

      expect(mockSalaRepository.find).toHaveBeenCalledWith({ where: { isActive: true } });
      expect(result).toEqual(salas);
    });
  });

  describe('findSalaById', () => {
    it('should return a sala by id', async () => {
      const sala = { id: '1', name: 'Sala 1', seats: [] };
      
      mockSalaRepository.findOne.mockResolvedValue(sala);

      const result = await service.findSalaById('1');

      expect(result).toEqual(sala);
    });

    it('should throw NotFoundException if sala not found', async () => {
      mockSalaRepository.findOne.mockResolvedValue(null);

      await expect(service.findSalaById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateSeats', () => {
    it('should generate seats for a sala', async () => {
      const sala = { id: '1', name: 'Sala 1' };
      const dto = { rows: 3, seatsPerRow: 5, specialSeats: [] };
      
      mockSalaRepository.findOne.mockResolvedValue(sala);
      mockSeatRepository.count.mockResolvedValue(0);
      mockSeatRepository.create.mockImplementation((data) => data);
      mockSeatRepository.save.mockImplementation((data) => Promise.resolve(Array.isArray(data) ? data : [data]));

      const result = await service.generateSeats('1', dto);

      expect(mockSeatRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if seats already generated', async () => {
      const sala = { id: '1', name: 'Sala 1' };
      const dto = { rows: 3, seatsPerRow: 5, specialSeats: [] };
      
      mockSalaRepository.findOne.mockResolvedValueOnce(sala);
      mockSeatRepository.count.mockResolvedValueOnce(10);

      await expect(service.generateSeats('1', dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getSeatsBySala', () => {
    it('should return seats for a sala', async () => {
      const seats = [
        { id: '1', row: 'A', number: 1, status: SeatStatus.AVAILABLE },
        { id: '2', row: 'A', number: 2, status: SeatStatus.AVAILABLE },
      ];
      
      mockSeatRepository.find.mockResolvedValue(seats);

      const result = await service.getSeatsBySala('1');

      expect(mockSeatRepository.find).toHaveBeenCalled();
      expect(result).toEqual(seats);
    });
  });

  describe('reserveSeats', () => {
    it('should reserve available seats', async () => {
      const seats = [
        { id: '1', row: 'A', number: 1, status: SeatStatus.AVAILABLE },
        { id: '2', row: 'A', number: 2, status: SeatStatus.AVAILABLE },
      ];
      
      mockSeatRepository.find.mockResolvedValue(seats);
      mockSeatRepository.save.mockImplementation((data) => Promise.resolve(data));

      const result = await service.reserveSeats(['1', '2'], 'session-1');

      expect(result.every(s => s.status === SeatStatus.RESERVED)).toBe(true);
    });

    it('should throw NotFoundException if some seats not found', async () => {
      mockSeatRepository.find.mockResolvedValue([]);

      await expect(service.reserveSeats(['1', '2'], 'session-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if some seats not available', async () => {
      const seats = [
        { id: '1', row: 'A', number: 1, status: SeatStatus.AVAILABLE },
        { id: '2', row: 'A', number: 2, status: SeatStatus.RESERVED },
      ];
      
      mockSeatRepository.find.mockResolvedValue(seats);

      await expect(service.reserveSeats(['1', '2'], 'session-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('releaseSeats', () => {
    it('should release seats', async () => {
      const seats = [
        { id: '1', row: 'A', number: 1, status: SeatStatus.RESERVED },
        { id: '2', row: 'A', number: 2, status: SeatStatus.RESERVED },
      ];
      
      mockSeatRepository.find.mockResolvedValue(seats);
      mockSeatRepository.save.mockImplementation((data) => Promise.resolve(data));

      const result = await service.releaseSeats(['1', '2']);

      expect(result.every(s => s.status === SeatStatus.AVAILABLE)).toBe(true);
    });
  });

  describe('occupySeats', () => {
    it('should occupy seats', async () => {
      const seats = [
        { id: '1', row: 'A', number: 1, status: SeatStatus.RESERVED },
        { id: '2', row: 'A', number: 2, status: SeatStatus.RESERVED },
      ];
      
      mockSeatRepository.find.mockResolvedValue(seats);
      mockSeatRepository.save.mockImplementation((data) => Promise.resolve(data));

      const result = await service.occupySeats(['1', '2']);

      expect(result.every(s => s.status === SeatStatus.OCCUPIED)).toBe(true);
    });
  });

  describe('getSeatLayout', () => {
    it('should return seat layout grouped by row', async () => {
      const seats = [
        { id: '1', row: 'A', number: 1, type: SeatType.STANDARD, status: SeatStatus.AVAILABLE, price: 25, isForDisability: false, isForElderly: false, isForPregnant: false },
        { id: '2', row: 'A', number: 2, type: SeatType.STANDARD, status: SeatStatus.AVAILABLE, price: 25, isForDisability: false, isForElderly: false, isForPregnant: false },
        { id: '3', row: 'B', number: 1, type: SeatType.VIP, status: SeatStatus.RESERVED, price: 50, isForDisability: false, isForElderly: false, isForPregnant: false },
      ];
      
      mockSeatRepository.find.mockResolvedValue(seats);

      const result = await service.getSeatLayout('1');

      expect(result).toHaveProperty('A');
      expect(result).toHaveProperty('B');
      expect(result['A'].length).toBe(2);
      expect(result['B'].length).toBe(1);
    });
  });
});
