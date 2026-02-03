import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Controller('products')
export class ProductsController {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  @Get()
  findAll() {
    return this.productRepo.find();
  }
}
