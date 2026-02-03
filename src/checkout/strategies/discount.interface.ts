import { Product } from '../../products/product.entity';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DiscountStrategy {
  calculate(items: CartItem[], isMember: boolean, currentTotal: number): number;
}
