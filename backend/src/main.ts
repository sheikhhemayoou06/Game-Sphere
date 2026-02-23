import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 Game Sphere API running on http://localhost:${port}/api`);
}
bootstrap();
