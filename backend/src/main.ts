import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Validation des variables d'environnement critiques
  const jwtSecret = configService.get<string>('jwt.secret');
  const nodeEnv = configService.get<string>('nodeEnv');

  if (!jwtSecret && nodeEnv === 'production') {
    logger.error('JWT_SECRET is required in production environment');
    process.exit(1);
  }

  if (!jwtSecret) {
    logger.warn('JWT_SECRET not set, using default secret. This is insecure for production!');
  }

  // Configuration CORS sécurisée
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const corsOrigins = frontendUrl.split(',').map(url => url.trim());
  
  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Headers de sécurité
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Route racine pour les health checks de Render
  app.getHttpAdapter().get('/', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'Time-Swap Backend API',
      timestamp: new Date().toISOString(),
    });
  });
  app.getHttpAdapter().head('/', (req, res) => {
    res.status(200).end();
  });

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);

  // Log toutes les routes enregistrées
  const server = app.getHttpServer();
  const router = app.getHttpAdapter().getInstance();
  logger.log(`Backend Time-Swap Network démarré sur http://localhost:${port}`);
  logger.log(`Sécurité renforcée : bcrypt, rate limiting, headers sécurisés`);
  logger.log(`Gestion d'erreurs améliorée avec filtres globaux et logging structuré`);
  
  // Debug: Vérifier les routes enregistrées
  logger.log('=== DEBUG: Routes enregistrées ===');
  const routes: string[] = [];
  router._router?.stack?.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle?.stack?.forEach((handler: any) => {
        if (handler.route) {
          routes.push(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${handler.route.path}`);
        }
      });
    }
  });
  routes.forEach(route => logger.log(`Route: ${route}`));
  logger.log('=== FIN DEBUG ===');
}
bootstrap();