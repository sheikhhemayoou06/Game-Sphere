import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: true, // Reflects the requesting origin, allowing all
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

  // Explicitly listen on 0.0.0.0 (IPv4) to ensure Render can detect the open port
  await app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Game Sphere API running on port ${port} /api`);
  });
}
bootstrap();
