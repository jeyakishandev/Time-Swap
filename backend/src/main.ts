import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration globale de validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Time-Swap Network API')
    .setDescription('API pour la plateforme d\'échange de crédits temps')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification des utilisateurs')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('transactions', 'Gestion des transactions de crédits')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend Time-Swap Network démarré sur http://localhost:${port}`);
  console.log(`📚 Documentation API disponible sur http://localhost:${port}/api/docs`);
}

bootstrap();

