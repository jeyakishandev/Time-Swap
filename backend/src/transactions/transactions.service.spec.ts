import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: PrismaService;
  let usersService: UsersService;

  // Mock data - J'ai appris à créer des données de test réalistes
  const mockUser1 = {
    id: 'user1',
    email: 'alice@test.com',
    username: 'alice',
    credits: 100,
    password: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser2 = {
    id: 'user2',
    email: 'bob@test.com',
    username: 'bob',
    credits: 50,
    password: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            creditTransaction: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transferCredits', () => {
    it('should transfer credits successfully', async () => {
      // Arrange - J'ai appris que c'est important de bien organiser les tests
      const transferDto = {
        senderId: 'user1',
        receiverId: 'user2',
        amount: 25,
        description: 'Test transfer',
      };

      const mockTransaction = {
        id: 'tx1',
        amount: 25,
        description: 'Test transfer',
        status: 'COMPLETED',
        senderId: 'user1',
        receiverId: 'user2',
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: { id: 'user1', username: 'alice', email: 'alice@test.com' },
        receiver: { id: 'user2', username: 'bob', email: 'bob@test.com' },
      };

      // Mock de la transaction atomique
      (prismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback({
          user: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockUser1) // sender
              .mockResolvedValueOnce(mockUser2), // receiver
            update: jest.fn().mockResolvedValue({}),
          },
          creditTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      // Act
      const result = await service.transferCredits(transferDto);

      // Assert
      expect(result).toEqual(mockTransaction);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when sender not found', async () => {
      // Arrange
      const transferDto = {
        senderId: 'nonexistent',
        receiverId: 'user2',
        amount: 25,
        description: 'Test transfer',
      };

      (prismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback({
          user: {
            findUnique: jest.fn().mockResolvedValueOnce(null), // sender not found
          },
        });
      });

      // Act & Assert
      await expect(service.transferCredits(transferDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient credits', async () => {
      // Arrange
      const transferDto = {
        senderId: 'user1',
        receiverId: 'user2',
        amount: 150, // More than user1 has (100)
        description: 'Test transfer',
      };

      (prismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback({
          user: {
            findUnique: jest.fn().mockResolvedValueOnce(mockUser1), // sender with 100 credits
          },
        });
      });

      // Act & Assert
      await expect(service.transferCredits(transferDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      // Arrange
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
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockTransactions);
      expect(prismaService.creditTransaction.findMany).toHaveBeenCalled();
    });
  });
});
