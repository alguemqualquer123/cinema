/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, Package } from '../entities/product.entity';

@Injectable()
export class PacoteService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
  ) { }

  async findAllProducts(): Promise<Product[]> {
    return this.productRepository.find({ where: { isActive: true } });
  }

  async findAllPackages(): Promise<Package[]> {
    return this.packageRepository.find({ where: { isActive: true } });
  }

  async findProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findPackageById(id: string): Promise<Package> {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async createPackage(data: Partial<Package>): Promise<Package> {
    const pkg = this.packageRepository.create(data);
    return this.packageRepository.save(pkg);
  }
}
