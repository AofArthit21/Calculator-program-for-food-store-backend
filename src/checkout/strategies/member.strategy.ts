import { DiscountStrategy, CartItem } from './discount.interface';

export class MemberDiscountStrategy implements DiscountStrategy {
  calculate(
    items: CartItem[],
    isMember: boolean,
    currentTotal: number,
  ): number {
    if (!isMember) return 0;
    // ลด 10% จากยอดรวม (ในที่นี้สมมติว่าลดจากยอดหลังหักส่วนลดอื่นแล้ว หรือยอดเต็ม ขึ้นอยู่กับ Business Logic)
    // ผมเลือกวิธี: ลดจากยอดสุทธิที่เหลืออยู่
    return currentTotal * 0.1;
  }
}
