import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    username: 'testuser',
    credits: 100,
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            creditTransaction: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // Arrange
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
      };

      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      // Arrange
      const mockUsers = [
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

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          username: true,
          credits: true,
          createdAt: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      // Arrange
      const userId = 'user1';
      const userWithoutPassword = {
        id: 'user1',
        email: 'test@example.com',
        username: 'testuser',
        credits: 100,
        createdAt: new Date(),
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(userWithoutPassword);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toEqual(userWithoutPassword);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          credits: true,
          createdAt: true,
        },
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      // Arrange
      const email = 'test@example.com';
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      // Arrange
      const username = 'testuser';
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await service.findByUsername(username);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
    });
  });

  describe('updateCredits', () => {
    it('should update user credits', async () => {
      // Arrange
      const userId = 'user1';
      const newCredits = 150;
      const updatedUser = { ...mockUser, credits: newCredits };

      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateCredits(userId, newCredits);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { credits: newCredits },
      });
    });
  });

  describe('findMyTransactions', () => {
    it('should return user transactions', async () => {
      // Arrange
      const userId = 'user1';
      const mockTransactions = [
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

      (prismaService.creditTransaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      // Act
      const result = await service.findMyTransactions(userId);

      // Assert
      expect(result).toEqual(mockTransactions);
      expect(prismaService.creditTransaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });
});
