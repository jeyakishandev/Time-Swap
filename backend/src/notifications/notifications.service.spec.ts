import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      notification: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a notification', async () => {
    const notificationData = {
      userId: 'user-id',
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'TEST',
    };
    const mockNotification = { id: 'notification-id', ...notificationData } as any;

    jest.spyOn(prismaService.notification, 'create').mockResolvedValue(mockNotification);

    const result = await service.createNotification(
      notificationData.userId,
      notificationData.title,
      notificationData.message,
      notificationData.type,
    );

    expect(result).toEqual(mockNotification);
    expect(prismaService.notification.create).toHaveBeenCalledWith({
      data: notificationData,
    });
  });

  it('should get user notifications', async () => {
    const userId = 'user-id';
    const mockNotifications = [
      { id: '1', title: 'Notification 1', userId },
      { id: '2', title: 'Notification 2', userId },
    ] as any;

    jest.spyOn(prismaService.notification, 'findMany').mockResolvedValue(mockNotifications);

    const result = await service.getUserNotifications(userId);
    expect(result).toEqual(mockNotifications);
    expect(prismaService.notification.findMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  });

  it('should mark notification as read', async () => {
    const notificationId = 'notification-id';
    const userId = 'user-id';
    const mockUpdatedNotification = { id: notificationId, isRead: true } as any;

    jest.spyOn(prismaService.notification, 'update').mockResolvedValue(mockUpdatedNotification);

    const result = await service.markAsRead(notificationId, userId);
    expect(result).toEqual(mockUpdatedNotification);
    expect(prismaService.notification.update).toHaveBeenCalledWith({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  });

  it('should mark all notifications as read', async () => {
    const userId = 'user-id';
    const mockResult = { count: 5 } as any;

    jest.spyOn(prismaService.notification, 'updateMany').mockResolvedValue(mockResult);

    const result = await service.markAllAsRead(userId);
    expect(result).toEqual(mockResult);
    expect(prismaService.notification.updateMany).toHaveBeenCalledWith({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  });

  it('should get unread count', async () => {
    const userId = 'user-id';
    const unreadCount = 3;

    jest.spyOn(prismaService.notification, 'count').mockResolvedValue(unreadCount);

    const result = await service.getUnreadCount(userId);
    expect(result).toEqual(unreadCount);
    expect(prismaService.notification.count).toHaveBeenCalledWith({
      where: { userId, isRead: false },
    });
  });

  it('should create booking request notification', async () => {
    const providerId = 'provider-id';
    const clientUsername = 'client123';
    const serviceTitle = 'Test Service';
    const mockNotification = {
      id: 'notification-id',
      title: 'Nouvelle demande de réservation',
      message: `${clientUsername} souhaite réserver votre service "${serviceTitle}"`,
      type: 'BOOKING_REQUEST',
    } as any;

    jest.spyOn(service, 'createNotification').mockResolvedValue(mockNotification);

    const result = await service.createBookingRequestNotification(
      providerId,
      clientUsername,
      serviceTitle,
    );

    expect(result).toEqual(mockNotification);
    expect(service.createNotification).toHaveBeenCalledWith(
      providerId,
      'Nouvelle demande de réservation',
      `${clientUsername} souhaite réserver votre service "${serviceTitle}"`,
      'BOOKING_REQUEST',
    );
  });
});

