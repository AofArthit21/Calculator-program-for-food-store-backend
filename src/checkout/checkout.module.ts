import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // เพิ่มบรรทัดนี้
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { Product } from '../products/product.entity'; // นำเข้า Product Entity

@Module({
  imports: [
    // เพิ่มบรรทัดนี้ลงไปเพื่อให้ CheckoutService สามารถ Inject ProductRepository ได้
    TypeOrmModule.forFeature([Product]),
  ],
  providers: [CheckoutService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
