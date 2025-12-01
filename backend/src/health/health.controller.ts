import { Controller, Get, Head, All, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log('HealthController initialisé');
  }

  @All()
  root() {
    this.logger.log('Route racine / appelée');
    // Route racine pour les health checks de Render (toutes les méthodes HTTP)
    return {
      status: 'ok',
      service: 'Time-Swap Backend API',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  async check() {
    try {
      // Vérifier la connexion à la base de données
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}

