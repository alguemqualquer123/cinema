import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SeatType } from '../entities/seat.entity';

export class CreateSeatDto {
  @IsString()
  row: string;

  @IsNumber()
  number: number;

  @IsOptional()
  @IsEnum(SeatType)
  type?: SeatType;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isForDisability?: boolean;

  @IsOptional()
  @IsBoolean()
  isForElderly?: boolean;

  @IsOptional()
  @IsBoolean()
  isForPregnant?: boolean;
}

export class CreateSalaDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  rows?: number;

  @IsOptional()
  @IsNumber()
  seatsPerRow?: number;

  @IsOptional()
  @IsBoolean()
  is3D?: boolean;

  @IsOptional()
  @IsBoolean()
  isIMAX?: boolean;

  @IsOptional()
  @IsBoolean()
  hasSoundDolby?: boolean;
}

export class GenerateSeatsDto {
  @IsNumber()
  rows: number;

  @IsNumber()
  seatsPerRow: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatTypeConfigDto)
  specialSeats: SeatTypeConfigDto[];
}

export class SeatTypeConfigDto {
  @IsString()
  row: string;

  @IsEnum(SeatType)
  type: SeatType;

  @IsOptional()
  @IsBoolean()
  isForDisability?: boolean;

  @IsOptional()
  @IsBoolean()
  isForElderly?: boolean;

  @IsOptional()
  @IsBoolean()
  isForPregnant?: boolean;
}

export class UpdateSeatStatusDto {
  @IsString()
  seatId: string;

  @IsString()
  status: string;
}

export class ReserveSeatsDto {
  @IsString({ each: true })
  seatIds: string[];

  @IsString()
  sessionId: string;
}
