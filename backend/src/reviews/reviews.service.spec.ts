import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createReviewDto: CreateReviewDto = {
      revieweeId: 'user2',
      rating: 5,
      comment: 'Great service!',
      serviceId: 'service1',
    };
    const reviewerId = 'user1';

    it('should create a review successfully', async () => {
      const mockReview = {
        id: 'review1',
        ...createReviewDto,
        reviewerId,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewer: { id: 'user1', username: 'reviewer' },
        reviewee: { id: 'user2', username: 'reviewee' },
        service: { id: 'service1', title: 'Service' },
      };

      mockPrismaService.review.create.mockResolvedValue(mockReview);

      const result = await service.create(createReviewDto, reviewerId);

      expect(result).toEqual(mockReview);
      expect(mockPrismaService.review.create).toHaveBeenCalledWith({
        data: {
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
          reviewerId,
          revieweeId: createReviewDto.revieweeId,
          serviceId: createReviewDto.serviceId,
          bookingId: createReviewDto.bookingId,
        },
        include: expect.any(Object),
      });
    });

    it('should throw ForbiddenException when reviewer tries to review themselves', async () => {
      await expect(service.create(createReviewDto, 'user2')).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.review.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when duplicate review exists', async () => {
      const prismaError = {
        code: 'P2002',
        meta: { target: ['reviewerId', 'bookingId'] },
      };

      mockPrismaService.review.create.mockRejectedValue(prismaError);

      await expect(service.create(createReviewDto, reviewerId)).rejects.toThrow(ConflictException);
    });

    it('should rethrow other errors', async () => {
      const error = new Error('Database error');
      mockPrismaService.review.create.mockRejectedValue(error);

      await expect(service.create(createReviewDto, reviewerId)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all reviews', async () => {
      const mockReviews = [
        { id: 'review1', rating: 5 },
        { id: 'review2', rating: 4 },
      ];

      mockPrismaService.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.findAll();

      expect(result).toEqual(mockReviews);
      expect(mockPrismaService.review.findMany).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return reviews for a specific user', async () => {
      const userId = 'user2';
      const mockReviews = [{ id: 'review1', revieweeId: userId }];

      mockPrismaService.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.findByUser(userId);

      expect(result).toEqual(mockReviews);
      expect(mockPrismaService.review.findMany).toHaveBeenCalledWith({
        where: { revieweeId: userId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByService', () => {
    it('should return reviews for a specific service', async () => {
      const serviceId = 'service1';
      const mockReviews = [{ id: 'review1', serviceId }];

      mockPrismaService.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.findByService(serviceId);

      expect(result).toEqual(mockReviews);
      expect(mockPrismaService.review.findMany).toHaveBeenCalledWith({
        where: { serviceId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a review by id', async () => {
      const reviewId = 'review1';
      const mockReview = { id: reviewId, rating: 5 };

      mockPrismaService.review.findUnique.mockResolvedValue(mockReview);

      const result = await service.findOne(reviewId);

      expect(result).toEqual(mockReview);
      expect(mockPrismaService.review.findUnique).toHaveBeenCalledWith({
        where: { id: reviewId },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when review not found', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateReviewDto: UpdateReviewDto = {
      rating: 4,
      comment: 'Updated comment',
    };
    const reviewId = 'review1';
    const userId = 'user1';

    it('should update a review successfully', async () => {
      const existingReview = {
        id: reviewId,
        reviewerId: userId,
        rating: 5,
      };
      const updatedReview = {
        ...existingReview,
        ...updateReviewDto,
      };

      mockPrismaService.review.findUnique.mockResolvedValue(existingReview);
      mockPrismaService.review.update.mockResolvedValue(updatedReview);

      const result = await service.update(reviewId, updateReviewDto, userId);

      expect(result).toEqual(updatedReview);
      expect(mockPrismaService.review.update).toHaveBeenCalledWith({
        where: { id: reviewId },
        data: updateReviewDto,
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when review not found', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(service.update(reviewId, updateReviewDto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the reviewer', async () => {
      const existingReview = {
        id: reviewId,
        reviewerId: 'other-user',
      };

      mockPrismaService.review.findUnique.mockResolvedValue(existingReview);

      await expect(service.update(reviewId, updateReviewDto, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const reviewId = 'review1';
    const userId = 'user1';

    it('should delete a review successfully', async () => {
      const existingReview = {
        id: reviewId,
        reviewerId: userId,
      };

      mockPrismaService.review.findUnique.mockResolvedValue(existingReview);
      mockPrismaService.review.delete.mockResolvedValue(existingReview);

      const result = await service.remove(reviewId, userId);

      expect(result).toEqual(existingReview);
      expect(mockPrismaService.review.delete).toHaveBeenCalledWith({
        where: { id: reviewId },
      });
    });

    it('should throw NotFoundException when review not found', async () => {
      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(service.remove(reviewId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the reviewer', async () => {
      const existingReview = {
        id: reviewId,
        reviewerId: 'other-user',
      };

      mockPrismaService.review.findUnique.mockResolvedValue(existingReview);

      await expect(service.remove(reviewId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAverageRating', () => {
    it('should calculate average rating for a user', async () => {
      const userId = 'user2';
      const mockReviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
      ];

      mockPrismaService.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.getAverageRating(userId);

      expect(result).toEqual({ average: 4.7, count: 3 });
    });

    it('should return 0 when no reviews exist', async () => {
      mockPrismaService.review.findMany.mockResolvedValue([]);

      const result = await service.getAverageRating('user2');

      expect(result).toEqual({ average: 0, count: 0 });
    });
  });

  describe('getServiceAverageRating', () => {
    it('should calculate average rating for a service', async () => {
      const serviceId = 'service1';
      const mockReviews = [
        { rating: 5 },
        { rating: 3 },
      ];

      mockPrismaService.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.getServiceAverageRating(serviceId);

      expect(result).toEqual({ average: 4, count: 2 });
    });

    it('should return 0 when no reviews exist', async () => {
      mockPrismaService.review.findMany.mockResolvedValue([]);

      const result = await service.getServiceAverageRating('service1');

      expect(result).toEqual({ average: 0, count: 0 });
    });
  });
});
