import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to database', async () => {
      // Mock the $connect method
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

      // Act
      await service.onModuleInit();

      // Assert
      expect(connectSpy).toHaveBeenCalled();
    });
  });
});
