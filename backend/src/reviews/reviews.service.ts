import { Injectable, NotFoundException, ConflictException, ForbiddenException, Optional, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private prisma: PrismaService,
    @Optional() private notificationsService?: NotificationsService,
    @Optional() private notificationsGateway?: NotificationsGateway,
  ) {}

  async create(createReviewDto: CreateReviewDto, reviewerId: string) {
    this.logger.debug(`Creating review for reviewee ${createReviewDto.revieweeId} by reviewer ${reviewerId}`);
    
    try {
      const { revieweeId, bookingId, serviceId, rating, comment } = createReviewDto;

      // Vérification basique
      if (reviewerId === revieweeId) {
        throw new ForbiddenException('Vous ne pouvez pas vous évaluer vous-même');
      }

      // Créer l'avis directement
      const review = await this.prisma.review.create({
        data: {
          rating,
          comment,
          reviewerId,
          revieweeId,
          serviceId,
          bookingId,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
              avatarSeed: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              username: true,
              avatarSeed: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      this.logger.log(`Review created successfully: ${review.id}`);
      return review;
    } catch (error) {
      this.logger.error(`Error creating review: ${error.message}`, error.stack);
      
      // Gérer l'erreur de contrainte unique (avis déjà existant)
      if (error.code === 'P2002' && error.meta?.target?.includes('reviewerId') && error.meta?.target?.includes('bookingId')) {
        throw new ConflictException('Vous avez déjà donné un avis pour cette réservation');
      }
      
      throw error;
    }
  }

  async findAll() {
    return this.prisma.review.findMany({
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            username: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: {
        revieweeId: userId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByService(serviceId: string) {
    return this.prisma.review.findMany({
      where: {
        serviceId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            username: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            username: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    if (review.reviewerId !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres avis');
    }

    return this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            username: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Avis non trouvé');
    }

    if (review.reviewerId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres avis');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }

  async getAverageRating(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { revieweeId: userId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;

    return {
      average: Math.round(average * 10) / 10, // Arrondi à 1 décimale
      count: reviews.length,
    };
  }

  async getServiceAverageRating(serviceId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { serviceId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;

    return {
      average: Math.round(average * 10) / 10, // Arrondi à 1 décimale
      count: reviews.length,
    };
  }
}
