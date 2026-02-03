/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../products/product.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { BulkDiscountStrategy } from './strategies/bulk.strategy';
import { MemberDiscountStrategy } from './strategies/member.strategy';
import { CartItem } from './strategies/discount.interface';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  // ประกาศไว้ครั้งเดียวเพื่อใช้ซ้ำ
  private readonly bulkStrategy = new BulkDiscountStrategy();
  private readonly memberStrategy = new MemberDiscountStrategy();

  async calculate(dto: CheckoutDto) {
    // 1. Fetch Products
    const productIds = dto.items.map(i => i.productId);
    const products = await this.productRepo.findBy({ id: In(productIds) });

    // 2. Map Cart Items & Validation
    const cartItems: CartItem[] = dto.items
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        // ถ้าไม่พบสินค้าใน DB ให้ข้ามไป (หรือจะ throw ตามเดิมก็ได้ถ้าต้องการ strict)
        if (!product) return null; 
        return { product, quantity: item.quantity };
      })
      .filter(item => item !== null) as CartItem[]; // กรองเอาเฉพาะตัวที่ไม่เป็น null

    // กรณีไม่มีสินค้าที่คำนวณได้เลย
    if (cartItems.length === 0) {
        return { subTotal: 0, discounts: { bulk: 0, member: 0 }, finalPrice: 0 };
    }

    // 3. Calculate Base Price
    const subTotal = cartItems.reduce(
      (sum, item) => sum + (Number(item.product.price) * item.quantity), 
      0
    );

    let currentTotalPrice = subTotal;

    // 4. Apply Strategies (เรียกใช้จากตัวแปรที่ประกาศไว้ข้างบน)
    
    // Step 1: Bulk Discount (5%)
    const bulkDiscount = this.bulkStrategy.calculate(cartItems, dto.isMember, currentTotalPrice);
    currentTotalPrice -= bulkDiscount;

    // Step 2: Member Discount (10%)
    const memberDiscount = this.memberStrategy.calculate(cartItems, dto.isMember, currentTotalPrice);
    currentTotalPrice -= memberDiscount;

    return {
      subTotal,
      discounts: {
        bulk: Number(bulkDiscount.toFixed(2)),
        member: Number(memberDiscount.toFixed(2))
      },
      finalPrice: Number(currentTotalPrice.toFixed(2))
    };
  }
}
