/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PacoteService } from '../services/pacote.service';

@Controller('pacotes')
export class PacoteController {
  constructor(private readonly pacoteService: PacoteService) { }

  @Get('produtos')
  async getAllProducts() {
    return this.pacoteService.findAllProducts();
  }

  @Get('combos')
  async getAllPackages() {
    return this.pacoteService.findAllPackages();
  }

  @Get('produtos/:id')
  async getProduct(@Param('id') id: string) {
    return this.pacoteService.findProductById(id);
  }

  @Get('combos/:id')
  async getPackage(@Param('id') id: string) {
    return this.pacoteService.findPackageById(id);
  }

  @Post('produtos')
  async createProduct(@Body() data: any) {
    return this.pacoteService.createProduct(data);
  }

  @Post('combos')
  async createPackage(@Body() data: any) {
    return this.pacoteService.createPackage(data);
  }
}
