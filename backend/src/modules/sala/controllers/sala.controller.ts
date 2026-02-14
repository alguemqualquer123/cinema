import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SalaService } from '../services/sala.service';
import { CreateSalaDto, GenerateSeatsDto } from '../dto/sala.dto';
import { JwtAuthGuard } from '../../conta/strategies/jwt-auth.guard';
import { RolesGuard } from '../../conta/strategies/roles.guard';
import { Roles } from '../../conta/strategies/roles.decorator';
import { UserRole } from '../../conta/entities/user.entity';

@Controller('salas')
export class SalaController {
  constructor(private readonly salaService: SalaService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createSalaDto: CreateSalaDto) {
    return this.salaService.createSala(createSalaDto);
  }

  @Get()
  findAll() {
    return this.salaService.findAllSalas();
  }

  @Get(':id/seats')
  getSeats(@Param('id') id: string) {
    return this.salaService.getSeatsBySala(id);
  }

  @Get(':id/layout')
  getLayout(@Param('id') id: string) {
    return this.salaService.getSeatLayout(id);
  }

  @Post(':id/generate-seats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  generateSeats(@Param('id') id: string, @Body() dto: GenerateSeatsDto) {
    return this.salaService.generateSeats(id, dto);
  }
}
