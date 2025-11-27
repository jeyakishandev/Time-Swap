import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotification = {
    id: 'notification1',
    title: 'Test Notification',
    message: 'Test message',
    type: 'INFO',
    isRead: false,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockNotificationsService = {
      getUserNotifications: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserNotifications', () => {
    it('should return user notifications', async () => {
      const mockRequest = { user: { userId: 'user1' } };
      const mockNotifications = [mockNotification];

      jest.spyOn(service, 'getUserNotifications').mockResolvedValue(mockNotifications as any);

      const result = await controller.getUserNotifications(mockRequest);

      expect(result).toEqual(mockNotifications);
      expect(service.getUserNotifications).toHaveBeenCalledWith('user1');
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      const mockRequest = { user: { userId: 'user1' } };
      const mockCount = 5;

      jest.spyOn(service, 'getUnreadCount').mockResolvedValue(mockCount);

      const result = await controller.getUnreadCount(mockRequest);

      expect(result).toEqual({ count: mockCount });
      expect(service.getUnreadCount).toHaveBeenCalledWith('user1');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = 'notification1';
      const mockRequest = { user: { userId: 'user1' } };
      const updatedNotification = { ...mockNotification, isRead: true };

      jest.spyOn(service, 'markAsRead').mockResolvedValue(updatedNotification as any);

      const result = await controller.markAsRead(notificationId, mockRequest);

      expect(result).toEqual(updatedNotification);
      expect(service.markAsRead).toHaveBeenCalledWith(notificationId, 'user1');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockRequest = { user: { userId: 'user1' } };
      const mockResult = { count: 3 };

      jest.spyOn(service, 'markAllAsRead').mockResolvedValue(mockResult as any);

      const result = await controller.markAllAsRead(mockRequest);

      expect(result).toEqual(mockResult);
      expect(service.markAllAsRead).toHaveBeenCalledWith('user1');
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const notificationId = 'notification1';
      const mockRequest = { user: { userId: 'user1' } };

      jest.spyOn(service, 'deleteNotification').mockResolvedValue(mockNotification as any);

      const result = await controller.deleteNotification(notificationId, mockRequest);

      expect(result).toEqual(mockNotification);
      expect(service.deleteNotification).toHaveBeenCalledWith(notificationId, 'user1');
    });
  });
});

