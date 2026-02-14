import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ValidacaoService } from '../services/validacao.service';
import { JwtAuthGuard } from '../../conta/strategies/jwt-auth.guard';
import { RolesGuard } from '../../conta/strategies/roles.guard';
import { Roles } from '../../conta/strategies/roles.decorator';
import { UserRole } from '../../conta/entities/user.entity';

@Controller('validation')
export class ValidacaoController {
  constructor(private readonly validacaoService: ValidacaoService) {}

  @Post('scan')
  validate(@Body() body: { qrCode: string }) {
    return this.validacaoService.validateQRCode(body.qrCode);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getStats() {
    return this.validacaoService.getValidationStats();
  }
}
