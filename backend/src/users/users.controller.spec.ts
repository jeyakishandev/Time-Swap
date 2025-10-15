import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockRequest = {
    user: {
      sub: 'user1',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findMyTransactions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      const expectedUsers = [
        {
          id: 'user1',
          email: 'test1@example.com',
          username: 'testuser1',
          credits: 100,
          createdAt: new Date(),
        },
        {
          id: 'user2',
          email: 'test2@example.com',
          username: 'testuser2',
          credits: 150,
          createdAt: new Date(),
        },
      ];

      (usersService.findAll as jest.Mock).mockResolvedValue(expectedUsers);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      // Arrange
      const expectedUser = {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        credits: 100,
        createdAt: new Date(),
      };

      (usersService.findOne as jest.Mock).mockResolvedValue(expectedUser);

      // Act
      const result = await controller.getProfile(mockRequest);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(usersService.findOne).toHaveBeenCalledWith('user1');
    });
  });

  describe('getMyTransactions', () => {
    it('should return user transactions', async () => {
      // Arrange
      const expectedTransactions = [
        {
          id: 'tx1',
          amount: 25,
          status: 'COMPLETED',
          senderId: 'user1',
          receiverId: 'user2',
          createdAt: new Date(),
          updatedAt: new Date(),
          sender: { id: 'user1', username: 'alice', email: 'alice@test.com' },
          receiver: { id: 'user2', username: 'bob', email: 'bob@test.com' },
        },
      ];

      (usersService.findMyTransactions as jest.Mock).mockResolvedValue(expectedTransactions);

      // Act
      const result = await controller.getMyTransactions(mockRequest);

      // Assert
      expect(result).toEqual(expectedTransactions);
      expect(usersService.findMyTransactions).toHaveBeenCalledWith('user1');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      // Arrange
      const userId = 'user1';
      const expectedUser = {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        credits: 100,
        createdAt: new Date(),
      };

      (usersService.findOne as jest.Mock).mockResolvedValue(expectedUser);

      // Act
      const result = await controller.findOne(userId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(usersService.findOne).toHaveBeenCalledWith(userId);
    });
  });
});
