import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Sala } from '../entities/sala.entity';
import { Seat, SeatStatus, SeatType } from '../entities/seat.entity';
import { CreateSalaDto, GenerateSeatsDto } from '../dto/sala.dto';

@Injectable()
export class SalaService {
  constructor(
    @InjectRepository(Sala)
    private salaRepository: Repository<Sala>,
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
  ) { }

  async createSala(createSalaDto: CreateSalaDto): Promise<Sala> {
    const sala = this.salaRepository.create(createSalaDto);
    return this.salaRepository.save(sala);
  }

  async findAllSalas(): Promise<Sala[]> {
    return this.salaRepository.find({ where: { isActive: true } });
  }

  async findSalaById(id: string): Promise<Sala> {
    const sala = await this.salaRepository.findOne({
      where: { id },
      relations: ['seats'],
    });
    if (!sala) throw new NotFoundException('Sala not found');
    return sala;
  }

  async generateSeats(salaId: string, dto: GenerateSeatsDto): Promise<Seat[]> {
    const sala = await this.findSalaById(salaId);

    const existingSeats = await this.seatRepository.count({
      where: { salaId },
    });
    if (existingSeats > 0) {
      throw new ConflictException('Seats already generated for this sala');
    }

    const seats: Seat[] = [];
    const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    for (let r = 0; r < dto.rows; r++) {
      const rowLetter = rows[r];
      const rowConfig = dto.specialSeats.find((s) => s.row === rowLetter);

      for (let s = 1; s <= dto.seatsPerRow; s++) {
        let seatType = SeatType.STANDARD;
        let isForDisability = false;
        let isForElderly = false;
        let isForPregnant = false;

        if (rowConfig) {
          seatType = rowConfig.type;
          isForDisability = rowConfig.isForDisability || false;
          isForElderly = rowConfig.isForElderly || false;
          isForPregnant = rowConfig.isForPregnant || false;
        }

        const seat = this.seatRepository.create({
          row: rowLetter,
          number: s,
          type: seatType,
          status: SeatStatus.AVAILABLE,
          salaId: sala.id,
          price: this.getSeatPrice(seatType),
          isForDisability,
          isForElderly,
          isForPregnant,
        });
        seats.push(seat);
      }
    }

    return this.seatRepository.save(seats);
  }

  private getSeatPrice(type: SeatType): number {
    switch (type) {
      case SeatType.VIP:
        return 50;
      case SeatType.PREFERENTIAL:
        return 35;
      case SeatType.ACCESSIBLE:
        return 30;
      default:
        return 25;
    }
  }

  async getSeatsBySala(salaId: string): Promise<Seat[]> {
    return this.seatRepository.find({
      where: { salaId },
      order: { row: 'ASC', number: 'ASC' },
    });
  }

  async reserveSeats(seatIds: string[], sessionId: string): Promise<Seat[]> {
    const seats = await this.seatRepository.find({
      where: { id: In(seatIds) },
    });

    if (seats.length !== seatIds.length) {
      throw new NotFoundException('Some seats not found');
    }

    const unavailable = seats.filter((s) => s.status !== SeatStatus.AVAILABLE);
    if (unavailable.length > 0) {
      throw new ConflictException(
        `Seats ${unavailable.map((s) => `${s.row}${s.number}`).join(', ')} are not available`,
      );
    }

    seats.forEach((seat) => {
      seat.status = SeatStatus.RESERVED;
    });

    return this.seatRepository.save(seats);
  }

  async releaseSeats(seatIds: string[]): Promise<Seat[]> {
    const seats = await this.seatRepository.find({
      where: { id: In(seatIds) },
    });

    seats.forEach((seat) => {
      seat.status = SeatStatus.AVAILABLE;
    });

    return this.seatRepository.save(seats);
  }

  async occupySeats(seatIds: string[]): Promise<Seat[]> {
    const seats = await this.seatRepository.find({
      where: { id: In(seatIds) },
    });

    seats.forEach((seat) => {
      seat.status = SeatStatus.OCCUPIED;
    });

    return this.seatRepository.save(seats);
  }

  async getSeatLayout(salaId: string): Promise<any> {
    const seats = await this.getSeatsBySala(salaId);

    const layout: Record<string, any[]> = {};
    seats.forEach((seat) => {
      if (!layout[seat.row]) {
        layout[seat.row] = [];
      }
      layout[seat.row].push({
        id: seat.id,
        number: seat.number,
        type: seat.type,
        status: seat.status,
        price: seat.price,
        isForDisability: seat.isForDisability,
        isForElderly: seat.isForElderly,
        isForPregnant: seat.isForPregnant,
      });
    });

    return layout;
  }
}
