import 'reflect-metadata';
import * as dotenv from 'dotenv';
// Load server settings only from .env.local (in server/, or /usr/src/app in Docker).
dotenv.config({ path: '.env.local' });

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import { mkdirSync } from 'fs';

async function bootstrap() {
  const uploadsDir = join(process.cwd(), 'uploads');
  mkdirSync(uploadsDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // CLIENT_ORIGIN can list several comma-separated origins. Browsers only accept
  // a CORS response when the origin matches exactly, so both localhost and
  // 127.0.0.1 are allowed by default.
  const allowedOrigins = (
    process.env.CLIENT_ORIGIN ?? 'http://localhost:3000,http://127.0.0.1:3000'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });
  app.useWebSocketAdapter(new WsAdapter(app));

  const config = new DocumentBuilder()
    .setTitle('TampIt API')
    .setDescription('Coffee tracker API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
  console.log(`Swagger available at http://localhost:${port}/api`);
}
bootstrap();
