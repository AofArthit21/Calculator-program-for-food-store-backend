/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from './checkout.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../products/product.entity';

describe('CheckoutService', () => {
  let service: CheckoutService;

  // Mock Repository ปรับปรุงให้รองรับ TypeORM FindOperator
  const mockRepo = {
    findBy: jest.fn().mockImplementation((where) => {
      // ดึง IDs ออกมาจาก Object 'where' (รองรับทั้ง Array และ In operator)
      const idsRaw = where.id;
      let ids: number[] = [];

      if (Array.isArray(idsRaw)) {
        ids = idsRaw;
      } else if (idsRaw && typeof idsRaw === 'object' && idsRaw._value) {
        ids = idsRaw._value; // ดึงค่าจาก In() operator
      } else if (typeof idsRaw === 'number') {
        ids = [idsRaw];
      }

      const allProducts = [
        { id: 1, name: 'Red set', price: 50, isBulkDiscountEligible: false },
        { id: 2, name: 'Green set', price: 40, isBulkDiscountEligible: true },
        { id: 7, name: 'Orange set', price: 120, isBulkDiscountEligible: true },
      ];

      const found = allProducts.filter((p) => ids.includes(p.id));
      return Promise.resolve(found);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: getRepositoryToken(Product), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<CheckoutService>(CheckoutService);
  });

  // --- 🧪 TEST CASES ---

  it('1. ราคาปกติ: ซื้อ Red 1 ชุด (ไม่มีส่วนลดใดๆ)', async () => {
    const result = await service.calculate({
      isMember: false,
      items: [{ productId: 1, quantity: 1 }],
    });
    expect(result.subTotal).toEqual(50);
    expect(result.finalPrice).toEqual(50);
  });

  it('2. ส่วนลดสมาชิก: ซื้อ Red 1 ชุด + บัตรสมาชิก (ลด 10%)', async () => {
    const result = await service.calculate({
      isMember: true,
      items: [{ productId: 1, quantity: 1 }],
    });
    // Subtotal 50 -> Member Discount 10% = 5
    expect(result.discounts.member).toEqual(5);
    expect(result.finalPrice).toEqual(45);
  });

  it('3. ส่วนลด Bulk: ซื้อ Green 2 ชุด (ลด 5% เฉพาะสินค้าที่ร่วมรายการ)', async () => {
    const result = await service.calculate({
      isMember: false,
      items: [{ productId: 2, quantity: 2 }],
    });
    // (40 * 2) = 80 -> Bulk Discount 5% = 4 บาท
    expect(result.discounts.bulk).toEqual(4);
    expect(result.finalPrice).toEqual(76);
  });

  it('4. ส่วนลดซ้อน: ซื้อ Orange 2 ชุด + บัตรสมาชิก (ลด Bulk ก่อนแล้วค่อยลดสมาชิก)', async () => {
    const result = await service.calculate({
      isMember: true,
      items: [{ productId: 7, quantity: 2 }],
    });
    // Subtotal: 120 * 2 = 240
    // Bulk 5%: 12 (เหลือ 228)
    // Member 10%: 22.8
    // Final: 240 - 12 - 22.8 = 205.2
    expect(result.discounts.bulk).toEqual(12);
    expect(result.discounts.member).toBeCloseTo(22.8);
    expect(result.finalPrice).toBeCloseTo(205.2);
  });

  it('5. ผสมหลายรายการ: Red (ไม่ร่วม Bulk) + Orange 2 ชุด (ร่วม Bulk)', async () => {
    const result = await service.calculate({
      isMember: false,
      items: [
        { productId: 1, quantity: 1 }, // 50 (ไม่อยู่ในเงื่อนไข Bulk)
        { productId: 7, quantity: 2 }, // 240 (ลด Bulk 5% = 12)
      ],
    });
    expect(result.subTotal).toEqual(290);
    expect(result.discounts.bulk).toEqual(12);
    expect(result.finalPrice).toEqual(278);
  });

  it('6. ขอบเขตข้อมูล: กรณีซื้อสินค้าที่ไม่มีในระบบ (ID 999)', async () => {
    const result = await service.calculate({
      isMember: false,
      items: [{ productId: 999, quantity: 1 }],
    });
    expect(result.subTotal).toEqual(0);
    expect(result.finalPrice).toEqual(0);
  });

  it('7. จำนวนมากแต่ไม่ลด: ซื้อ Red 10 ชุด (ร่วมรายการแต่ isBulkDiscountEligible เป็น false)', async () => {
    const result = await service.calculate({
      isMember: false,
      items: [{ productId: 1, quantity: 10 }],
    });
    expect(result.subTotal).toEqual(500);
    expect(result.discounts.bulk).toEqual(0); // ต้องเป็น 0 เพราะ Red ไม่ร่วมรายการลด 5%
    expect(result.finalPrice).toEqual(500);
  });
});
