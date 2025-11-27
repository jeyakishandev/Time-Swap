import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  const mockReview = {
    id: 'review1',
    rating: 5,
    comment: 'Great service!',
    reviewerId: 'user1',
    revieweeId: 'user2',
    serviceId: 'service1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockReviewsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByUser: jest.fn(),
      findByService: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getAverageRating: jest.fn(),
      getServiceAverageRating: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a review', async () => {
      const createReviewDto: CreateReviewDto = {
        revieweeId: 'user2',
        rating: 5,
        comment: 'Great service!',
        serviceId: 'service1',
      };
      const mockRequest = { user: { sub: 'user1' } };

      jest.spyOn(service, 'create').mockResolvedValue(mockReview as any);

      const result = await controller.create(createReviewDto, mockRequest);

      expect(result).toEqual(mockReview);
      expect(service.create).toHaveBeenCalledWith(createReviewDto, 'user1');
    });
  });

  describe('findAll', () => {
    it('should return all reviews', async () => {
      const mockReviews = [mockReview];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockReviews as any);

      const result = await controller.findAll();

      expect(result).toEqual(mockReviews);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return reviews for a specific user', async () => {
      const userId = 'user2';
      const mockReviews = [mockReview];

      jest.spyOn(service, 'findByUser').mockResolvedValue(mockReviews as any);

      const result = await controller.findByUser(userId);

      expect(result).toEqual(mockReviews);
      expect(service.findByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('findByService', () => {
    it('should return reviews for a specific service', async () => {
      const serviceId = 'service1';
      const mockReviews = [mockReview];

      jest.spyOn(service, 'findByService').mockResolvedValue(mockReviews as any);

      const result = await controller.findByService(serviceId);

      expect(result).toEqual(mockReviews);
      expect(service.findByService).toHaveBeenCalledWith(serviceId);
    });
  });

  describe('getUserAverageRating', () => {
    it('should return average rating for a user', async () => {
      const userId = 'user2';
      const mockAverage = { average: 4.5, count: 10 };

      jest.spyOn(service, 'getAverageRating').mockResolvedValue(mockAverage as any);

      const result = await controller.getUserAverageRating(userId);

      expect(result).toEqual(mockAverage);
      expect(service.getAverageRating).toHaveBeenCalledWith(userId);
    });
  });

  describe('getServiceAverageRating', () => {
    it('should return average rating for a service', async () => {
      const serviceId = 'service1';
      const mockAverage = { average: 4.8, count: 5 };

      jest.spyOn(service, 'getServiceAverageRating').mockResolvedValue(mockAverage as any);

      const result = await controller.getServiceAverageRating(serviceId);

      expect(result).toEqual(mockAverage);
      expect(service.getServiceAverageRating).toHaveBeenCalledWith(serviceId);
    });
  });

  describe('findOne', () => {
    it('should return a specific review', async () => {
      const reviewId = 'review1';

      jest.spyOn(service, 'findOne').mockResolvedValue(mockReview as any);

      const result = await controller.findOne(reviewId);

      expect(result).toEqual(mockReview);
      expect(service.findOne).toHaveBeenCalledWith(reviewId);
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      const reviewId = 'review1';
      const updateReviewDto: UpdateReviewDto = {
        rating: 4,
        comment: 'Updated comment',
      };
      const mockRequest = { user: { sub: 'user1' } };
      const updatedReview = { ...mockReview, ...updateReviewDto };

      jest.spyOn(service, 'update').mockResolvedValue(updatedReview as any);

      const result = await controller.update(reviewId, updateReviewDto, mockRequest);

      expect(result).toEqual(updatedReview);
      expect(service.update).toHaveBeenCalledWith(reviewId, updateReviewDto, 'user1');
    });
  });

  describe('remove', () => {
    it('should delete a review', async () => {
      const reviewId = 'review1';
      const mockRequest = { user: { sub: 'user1' } };

      jest.spyOn(service, 'remove').mockResolvedValue(mockReview as any);

      const result = await controller.remove(reviewId, mockRequest);

      expect(result).toEqual(mockReview);
      expect(service.remove).toHaveBeenCalledWith(reviewId, 'user1');
    });
  });
});
