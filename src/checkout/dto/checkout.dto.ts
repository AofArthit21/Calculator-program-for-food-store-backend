import { IsInt, Min, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @IsBoolean()
  isMember: boolean;
}
