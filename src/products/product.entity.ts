import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  // Flag เพื่อระบุว่าสินค้านี้ร่วมรายการลดราคาเมื่อสั่งเบิ้ลหรือไม่ (Orange, Pink, Green)
  @Column({ default: false })
  isBulkDiscountEligible: boolean;
}
