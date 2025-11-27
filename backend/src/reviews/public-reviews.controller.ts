import { Controller, Get, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('public/reviews')
export class PublicReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('service/:serviceId/average')
  getServiceAverageRating(@Param('serviceId') serviceId: string) {
    return this.reviewsService.getServiceAverageRating(serviceId);
  }

  @Get('service/:serviceId')
  findByService(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findByService(serviceId);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }
}
