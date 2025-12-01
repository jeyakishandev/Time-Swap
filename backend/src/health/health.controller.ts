import { Controller, Get, Head, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Head()
  async root(@Res() res: Response) {
    // Route racine pour les health checks de Render
    res.status(200).json({
      status: 'ok',
      service: 'Time-Swap Backend API',
      timestamp: new Date().toISOString(),
    });
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

