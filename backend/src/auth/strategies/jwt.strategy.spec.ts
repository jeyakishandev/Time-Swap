import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'jwt.secret') {
          return 'test-secret-key';
        }
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object from payload', async () => {
      const payload = {
        sub: 'user123',
        email: 'test@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: 'user123',
        userId: 'user123',
        email: 'test@example.com',
      });
    });

    it('should handle payload without email', async () => {
      const payload = {
        sub: 'user123',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: 'user123',
        userId: 'user123',
        email: undefined,
      });
    });
  });

  describe('constructor', () => {
    it('should use JWT secret from ConfigService', () => {
      expect(configService.get).toHaveBeenCalledWith('jwt.secret');
    });

    it('should use default secret if ConfigService returns undefined', async () => {
      const mockConfigServiceWithoutSecret = {
        get: jest.fn(() => undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtStrategy,
          {
            provide: ConfigService,
            useValue: mockConfigServiceWithoutSecret,
          },
        ],
      }).compile();

      const strategyWithoutSecret = module.get<JwtStrategy>(JwtStrategy);
      expect(strategyWithoutSecret).toBeDefined();
    });
  });
});

