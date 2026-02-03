/* eslint-disable @typescript-eslint/no-unused-vars */
import { DiscountStrategy, CartItem } from './discount.interface';

export class BulkDiscountStrategy implements DiscountStrategy {
  calculate(
    items: CartItem[],
    _isMember?: boolean,
    _currentTotal?: number,
  ): number {
    let discount = 0;
    items.forEach((item) => {
      if (item.product.isBulkDiscountEligible && item.quantity >= 2) {
        discount += Number(item.product.price) * item.quantity * 0.05;
      }
    });
    return discount;
  }
}
