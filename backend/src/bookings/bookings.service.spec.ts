import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;
  let notificationsGateway: NotificationsGateway;

  beforeEach(async () => {
    const mockPrismaService = {
      booking: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      service: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      creditTransaction: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockNotificationsService = {
      createBookingRequestNotification: jest.fn(),
      createBookingConfirmedNotification: jest.fn(),
      createPaymentReceivedNotification: jest.fn(),
    };

    const mockNotificationsGateway = {
      sendNotificationToUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: NotificationsGateway,
          useValue: mockNotificationsGateway,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    notificationsGateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a booking', async () => {
    const createBookingDto = {
      serviceId: 'service-id',
      hours: 2,
      notes: 'Test booking',
    };
    const clientId = 'client-id';
    const mockService = {
      id: 'service-id',
      pricePerHour: 25.0,
      providerId: 'provider-id',
      isActive: true,
      provider: { id: 'provider-id' },
    } as any;
    const mockClient = {
      id: 'client-id',
      credits: 100.0,
    } as any;
    const mockBooking = {
      id: 'booking-id',
      ...createBookingDto,
      clientId,
      providerId: 'provider-id',
      totalPrice: 50.0,
      status: 'PENDING',
      client: { username: 'client123' },
      service: { title: 'Test Service' },
    } as any;

    jest.spyOn(prismaService.service, 'findUnique').mockResolvedValue(mockService);
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockClient);
    jest.spyOn(prismaService.booking, 'create').mockResolvedValue(mockBooking);
    jest.spyOn(notificationsService, 'createBookingRequestNotification').mockResolvedValue({} as any);
    jest.spyOn(notificationsGateway, 'sendNotificationToUser').mockResolvedValue(undefined);

    const result = await service.create(createBookingDto, clientId);
    expect(result).toEqual(mockBooking);
    expect(prismaService.service.findUnique).toHaveBeenCalledWith({
      where: { id: 'service-id' },
      include: { provider: true },
    });
  });

  it('should throw NotFoundException when service not found', async () => {
    const createBookingDto = {
      serviceId: 'non-existent-service',
      hours: 2,
    };
    const clientId = 'client-id';

    jest.spyOn(prismaService.service, 'findUnique').mockResolvedValue(null);

    await expect(service.create(createBookingDto, clientId)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when booking own service', async () => {
    const createBookingDto = {
      serviceId: 'service-id',
      hours: 2,
    };
    const clientId = 'client-id';
    const mockService = {
      id: 'service-id',
      pricePerHour: 25.0,
      providerId: 'client-id', // Same as clientId
      provider: { id: 'client-id' },
    } as any;

    jest.spyOn(prismaService.service, 'findUnique').mockResolvedValue(mockService);

    await expect(service.create(createBookingDto, clientId)).rejects.toThrow(BadRequestException);
  });

  it('should find all bookings', async () => {
    const mockBookings = [
      { id: '1', status: 'PENDING' },
      { id: '2', status: 'CONFIRMED' },
    ] as any;

    jest.spyOn(prismaService.booking, 'findMany').mockResolvedValue(mockBookings);

    const result = await service.findAll();
    expect(result).toEqual(mockBookings);
    expect(prismaService.booking.findMany).toHaveBeenCalledWith({
      include: {
        client: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should find bookings by user', async () => {
    const userId = 'user-id';
    const mockBookings = [
      { id: '1', clientId: userId },
      { id: '2', providerId: userId },
    ] as any;

    jest.spyOn(prismaService.booking, 'findMany').mockResolvedValue(mockBookings);

    const result = await service.findByUser(userId);
    expect(result).toEqual(mockBookings);
    expect(prismaService.booking.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { clientId: userId },
          { providerId: userId },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should find one booking', async () => {
    const bookingId = 'booking-id';
    const mockBooking = {
      id: bookingId,
      status: 'PENDING',
      clientId: 'client-id',
      providerId: 'provider-id',
    } as any;

    jest.spyOn(prismaService.booking, 'findUnique').mockResolvedValue(mockBooking);

    const result = await service.findOne(bookingId);
    expect(result).toEqual(mockBooking);
    expect(prismaService.booking.findUnique).toHaveBeenCalledWith({
      where: { id: bookingId },
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        provider: { select: { id: true, username: true, email: true } }
      }
    });
  });

  it('should throw NotFoundException when booking not found', async () => {
    const bookingId = 'non-existent-booking';

    jest.spyOn(prismaService.booking, 'findUnique').mockResolvedValue(null);

    await expect(service.findOne(bookingId)).rejects.toThrow(NotFoundException);
  });

  it('should update a booking', async () => {
    const bookingId = 'booking-id';
    const userId = 'user-id';
    const updateBookingDto = { notes: 'Updated notes' };
    const mockBooking = {
      id: bookingId,
      clientId: userId,
      providerId: 'provider-id',
    } as any;
    const mockUpdatedBooking = { ...mockBooking, ...updateBookingDto } as any;

    jest.spyOn(service, 'findOne').mockResolvedValue(mockBooking);
    jest.spyOn(prismaService.booking, 'update').mockResolvedValue(mockUpdatedBooking);

    const result = await service.update(bookingId, updateBookingDto, userId);
    expect(result).toEqual(mockUpdatedBooking);
    expect(prismaService.booking.update).toHaveBeenCalledWith({
      where: { id: bookingId },
      data: updateBookingDto,
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        provider: { select: { id: true, username: true, email: true } }
      }
    });
  });

  it('should throw ForbiddenException when updating someone else booking', async () => {
    const bookingId = 'booking-id';
    const userId = 'different-user';
    const updateBookingDto = { notes: 'Updated notes' };
    const mockBooking = {
      id: bookingId,
      clientId: 'client-id',
      providerId: 'provider-id',
    } as any;

    jest.spyOn(service, 'findOne').mockResolvedValue(mockBooking);

    await expect(service.update(bookingId, updateBookingDto, userId)).rejects.toThrow(ForbiddenException);
  });

  it('should cancel a pending booking', async () => {
    const bookingId = 'booking-id';
    const userId = 'user-id';
    const mockBooking = {
      id: bookingId,
      clientId: userId,
      providerId: 'provider-id',
      status: 'PENDING',
    } as any;
    const mockCancelledBooking = { ...mockBooking, status: 'CANCELLED' } as any;

    jest.spyOn(service, 'findOne').mockResolvedValue(mockBooking);
    jest.spyOn(prismaService.booking, 'update').mockResolvedValue(mockCancelledBooking);

    const result = await service.cancel(bookingId, userId);
    expect(result).toEqual(mockCancelledBooking);
    expect(prismaService.booking.update).toHaveBeenCalledWith({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        provider: { select: { id: true, username: true, email: true } }
      }
    });
  });

  it('should throw BadRequestException when cancelling completed booking', async () => {
    const bookingId = 'booking-id';
    const userId = 'user-id';
    const mockBooking = {
      id: bookingId,
      clientId: userId,
      providerId: 'provider-id',
      status: 'COMPLETED',
    } as any;

    jest.spyOn(service, 'findOne').mockResolvedValue(mockBooking);

    await expect(service.cancel(bookingId, userId)).rejects.toThrow(BadRequestException);
  });

  it('should complete a booking', async () => {
    const bookingId = 'booking-id';
    const providerId = 'provider-id';
    const mockBooking = {
      id: bookingId,
      providerId,
      status: 'CONFIRMED',
    } as any;
    const mockCompletedBooking = { ...mockBooking, status: 'COMPLETED' } as any;

    jest.spyOn(service, 'findOne').mockResolvedValue(mockBooking);
    jest.spyOn(prismaService.booking, 'update').mockResolvedValue(mockCompletedBooking);

    const result = await service.complete(bookingId, providerId);
    expect(result).toEqual(mockCompletedBooking);
    expect(prismaService.booking.update).toHaveBeenCalledWith({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        provider: { select: { id: true, username: true, email: true } }
      }
    });
  });

  it('should remove a booking', async () => {
    const bookingId = 'booking-id';
    const userId = 'user-id';
    const mockBooking = {
      id: bookingId,
      clientId: userId,
      providerId: 'provider-id',
    } as any;

    jest.spyOn(service, 'findOne').mockResolvedValue(mockBooking);
    jest.spyOn(prismaService.booking, 'delete').mockResolvedValue(mockBooking);

    const result = await service.remove(bookingId, userId);
    expect(result).toEqual(mockBooking);
    expect(prismaService.booking.delete).toHaveBeenCalledWith({
      where: { id: bookingId }
    });
  });
});