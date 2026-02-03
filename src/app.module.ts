import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity';
import { CheckoutModule } from './checkout/checkout.module';
import { ProductsController } from './products/products.controller';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [Product],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Product]),
    CheckoutModule,
  ],
  controllers: [ProductsController],
})
export class AppModule implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async onModuleInit() {
    const count = await this.productRepo.count();
    if (count === 0) {
      const items = [
        { name: 'Red set', price: 50, isBulkDiscountEligible: false },
        { name: 'Green set', price: 40, isBulkDiscountEligible: true },
        { name: 'Blue set', price: 30, isBulkDiscountEligible: false },
        { name: 'Yellow set', price: 50, isBulkDiscountEligible: false },
        { name: 'Pink set', price: 80, isBulkDiscountEligible: true },
        { name: 'Purple set', price: 90, isBulkDiscountEligible: false },
        { name: 'Orange set', price: 120, isBulkDiscountEligible: true },
      ];
      await this.productRepo.save(items);
      console.log('--- Seed Data Completed ---');
    }
  }
}
