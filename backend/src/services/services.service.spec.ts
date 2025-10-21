import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ServicesService', () => {
  let service: ServicesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      service: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a service', async () => {
    const createServiceDto = {
      title: 'Test Service',
      description: 'Test Description',
      category: 'Test Category',
      pricePerHour: 25.0,
    };
    const providerId = 'test-provider-id';
    const mockService = { id: 'test-id', ...createServiceDto, providerId } as any;

    jest.spyOn(prismaService.service, 'create').mockResolvedValue(mockService);

    const result = await service.create(createServiceDto, providerId);
    expect(result).toEqual(mockService);
    expect(prismaService.service.create).toHaveBeenCalledWith({
      data: {
        ...createServiceDto,
        providerId,
      },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  });

  it('should find all services', async () => {
    const mockServices = [
      { id: '1', title: 'Service 1' },
      { id: '2', title: 'Service 2' },
    ] as any;

    jest.spyOn(prismaService.service, 'findMany').mockResolvedValue(mockServices);

    const result = await service.findAll();
    expect(result).toEqual(mockServices);
    expect(prismaService.service.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should find one service', async () => {
    const mockService = { id: 'test-id', title: 'Test Service' } as any;
    const serviceId = 'test-id';

    jest.spyOn(prismaService.service, 'findUnique').mockResolvedValue(mockService);

    const result = await service.findOne(serviceId);
    expect(result).toEqual(mockService);
    expect(prismaService.service.findUnique).toHaveBeenCalledWith({
      where: { id: serviceId },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  });

  it('should update a service', async () => {
    const serviceId = 'service-id';
    const providerId = 'provider-id';
    const updateServiceDto = { title: 'Updated Service' };
    const mockService = {
      id: serviceId,
      providerId,
    } as any;
    const mockUpdatedService = { ...mockService, ...updateServiceDto } as any;

    jest.spyOn(prismaService.service, 'findUnique').mockResolvedValue(mockService);
    jest.spyOn(prismaService.service, 'update').mockResolvedValue(mockUpdatedService);

    const result = await service.update(serviceId, updateServiceDto, providerId);
    expect(result).toEqual(mockUpdatedService);
    expect(prismaService.service.update).toHaveBeenCalledWith({
      where: { id: serviceId },
      data: updateServiceDto,
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  });

  it('should throw error when updating someone else service', async () => {
    const serviceId = 'service-id';
    const providerId = 'different-provider';
    const updateServiceDto = { title: 'Updated Service' };
    const mockService = {
      id: serviceId,
      providerId: 'original-provider',
    } as any;

    jest.spyOn(prismaService.service, 'findUnique').mockResolvedValue(mockService);

    await expect(service.update(serviceId, updateServiceDto, providerId)).rejects.toThrow('Service non trouvé ou non autorisé');
  });

  it('should remove a service', async () => {
    const serviceId = 'service-id';
    const providerId = 'provider-id';
    const mockService = {
      id: serviceId,
      providerId,
    } as any;
    const mockRemovedService = { ...mockService, isActive: false } as any;

    jest.spyOn(prismaService.service, 'findUnique').mockResolvedValue(mockService);
    jest.spyOn(prismaService.service, 'update').mockResolvedValue(mockRemovedService);

    const result = await service.remove(serviceId, providerId);
    expect(result).toEqual(mockRemovedService);
    expect(prismaService.service.update).toHaveBeenCalledWith({
      where: { id: serviceId },
      data: { isActive: false },
    });
  });

  it('should find services by category', async () => {
    const category = 'Test Category';
    const mockServices = [
      { id: '1', title: 'Service 1', category },
      { id: '2', title: 'Service 2', category },
    ] as any;

    jest.spyOn(prismaService.service, 'findMany').mockResolvedValue(mockServices);

    const result = await service.findByCategory(category);
    expect(result).toEqual(mockServices);
    expect(prismaService.service.findMany).toHaveBeenCalledWith({
      where: {
        category,
        isActive: true,
      },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should find services by provider', async () => {
    const providerId = 'provider-id';
    const mockServices = [
      { id: '1', title: 'Service 1', providerId },
      { id: '2', title: 'Service 2', providerId },
    ] as any;

    jest.spyOn(prismaService.service, 'findMany').mockResolvedValue(mockServices);

    const result = await service.findByProvider(providerId);
    expect(result).toEqual(mockServices);
    expect(prismaService.service.findMany).toHaveBeenCalledWith({
      where: {
        providerId,
      },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});
