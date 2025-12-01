import { Module, Logger } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
})
export class HealthModule {
  private readonly logger = new Logger(HealthModule.name);

  constructor() {
    this.logger.log('HealthModule chargé');
    this.logger.log('HealthController enregistré dans HealthModule');
  }
}

