import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // ให้ Frontend เรียกได้
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3001); // Run on port 3001
}
bootstrap();
