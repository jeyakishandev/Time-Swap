import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

describe('ServicesController', () => {
  let controller: ServicesController;
  let service: ServicesService;

  beforeEach(async () => {
    const mockServicesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a service', async () => {
    const createServiceDto = {
      title: 'Test Service',
      description: 'Test Description',
      category: 'Test Category',
      pricePerHour: 25.0,
    };
    const mockService = { id: 'test-id', ...createServiceDto } as any;
    const mockRequest = { user: { userId: 'test-user-id' } };

    jest.spyOn(service, 'create').mockResolvedValue(mockService);

    const result = await controller.create(createServiceDto, mockRequest);
    expect(result).toEqual(mockService);
    expect(service.create).toHaveBeenCalledWith(createServiceDto, 'test-user-id');
  });

  it('should find all services', async () => {
    const mockServices = [
      { id: '1', title: 'Service 1' },
      { id: '2', title: 'Service 2' },
    ] as any;

    jest.spyOn(service, 'findAll').mockResolvedValue(mockServices);

    const result = await controller.findAll();
    expect(result).toEqual(mockServices);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find one service', async () => {
    const mockService = { id: 'test-id', title: 'Test Service' } as any;
    const serviceId = 'test-id';

    jest.spyOn(service, 'findOne').mockResolvedValue(mockService);

    const result = await controller.findOne(serviceId);
    expect(result).toEqual(mockService);
    expect(service.findOne).toHaveBeenCalledWith(serviceId);
  });
});
