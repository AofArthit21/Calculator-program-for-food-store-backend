/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API Testing (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // ทดสอบการดึงข้อมูลสินค้าจากฐานข้อมูลจริง (หรือ Seed data)
  it('GET /products - ควรได้รับรายการสินค้าเป็น Array', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  // ทดสอบการยิง Checkout
  it('POST /checkout - ควรคำนวณราคากลับมาถูกต้อง', () => {
    return request(app.getHttpServer())
      .post('/checkout')
      .send({
        isMember: true,
        items: [{ productId: 1, quantity: 1 }],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('finalPrice');
        expect(res.body).toHaveProperty('discounts');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
