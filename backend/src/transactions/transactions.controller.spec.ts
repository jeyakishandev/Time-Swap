import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let transactionsService: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: {
            transferCredits: jest.fn(),
            findAll: jest.fn(),
            findByUser: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    transactionsService = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should transfer credits', async () => {
      // Arrange
      const createTransactionDto: CreateTransactionDto = {
        senderId: 'user1',
        receiverId: 'user2',
        amount: 25,
        description: 'Test transfer',
      };

      const expectedTransaction = {
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

      (transactionsService.transferCredits as jest.Mock).mockResolvedValue(expectedTransaction);

      // Act
      const result = await controller.create(createTransactionDto);

      // Assert
      expect(result).toEqual(expectedTransaction);
      expect(transactionsService.transferCredits).toHaveBeenCalledWith(createTransactionDto);
    });
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
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

      (transactionsService.findAll as jest.Mock).mockResolvedValue(expectedTransactions);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(expectedTransactions);
      expect(transactionsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return transactions for a specific user', async () => {
      // Arrange
      const userId = 'user1';
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

      (transactionsService.findByUser as jest.Mock).mockResolvedValue(expectedTransactions);

      // Act
      const result = await controller.findByUser(userId);

      // Assert
      expect(result).toEqual(expectedTransactions);
      expect(transactionsService.findByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('should return a specific transaction', async () => {
      // Arrange
      const transactionId = 'tx1';
      const expectedTransaction = {
        id: 'tx1',
        amount: 25,
        status: 'COMPLETED',
        senderId: 'user1',
        receiverId: 'user2',
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: { id: 'user1', username: 'alice', email: 'alice@test.com' },
        receiver: { id: 'user2', username: 'bob', email: 'bob@test.com' },
      };

      (transactionsService.findOne as jest.Mock).mockResolvedValue(expectedTransaction);

      // Act
      const result = await controller.findOne(transactionId);

      // Assert
      expect(result).toEqual(expectedTransaction);
      expect(transactionsService.findOne).toHaveBeenCalledWith(transactionId);
    });
  });
});
