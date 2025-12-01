import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    const dbUrl = process.env.DATABASE_URL || '';
    const dbType = dbUrl.startsWith('postgresql') ? 'PostgreSQL' : 
                   dbUrl.startsWith('file:') ? 'SQLite' : 'Unknown';
    this.logger.log(`Database ${dbType} connected via Prisma`);
  }
}
