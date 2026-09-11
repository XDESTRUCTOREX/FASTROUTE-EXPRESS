import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import 'dotenv/config';
import { AppModule } from './app.module';

if (existsSync('.env')) {
  loadEnvFile();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`FastRoute Express corriendo en: http://localhost:${port}`);
}

void bootstrap();
