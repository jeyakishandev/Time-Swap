import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, reviewerId: string) {
    const { revieweeId, bookingId, serviceId, rating, comment } = createReviewDto;

    // Vérifier que l'utilisateur existe
    const reviewee = await this.prisma.user.findUnique({
      where: { id: revieweeId },
    });

    if (!reviewee) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier qu'on ne peut pas s'évaluer soi-même
    if (reviewerId === revieweeId) {
      throw new ForbiddenException('Vous ne pouvez pas vous évaluer vous-même');
    }

    // Si une réservation est spécifiée, vérifier qu'elle existe et appartient au reviewer
    if (bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { client: true, provider: true },
      });

      if (!booking) {
        throw new NotFoundException('Réservation non trouvée');
      }

      if (booking.clientId !== reviewerId && booking.providerId !== reviewerId) {
        throw new ForbiddenException('Vous ne pouvez évaluer que les réservations auxquelles vous participez');
      }

      // Vérifier qu'il n'y a pas déjà un avis pour cette réservation
      const existingReview = await this.prisma.review.findUnique({
        where: {
          reviewerId_bookingId: {
            reviewerId,
            bookingId,
          },
        },
      });

      if (existingReview) {
        throw new ConflictException('Vous avez déjà évalué cette réservation');
      }

      // Vérifier que la réservation est terminée
      if (booking.status !== 'COMPLETED') {
        throw new ForbiddenException('Vous ne pouvez évaluer que les réservations terminées');
      }
    }

    return this.prisma.review.create({
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
