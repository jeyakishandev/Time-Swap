import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginatedResponse, PaginationQuery } from '../common/interfaces/paginated-response.interface';
import { SearchServicesDto, SortBy, SortOrder } from './dto/search-services.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto, providerId: string) {
    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        providerId,
      },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            avatarSeed: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(pagination?: PaginationQuery): Promise<PaginatedResponse<any>> {
    const page = pagination?.page || 1;
    const limit = Math.min(100, Math.max(1, pagination?.limit || 10));
    const skip = (page - 1) * limit;

    const where = { isActive: true };

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          provider: {
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
      }),
      this.prisma.service.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findByProvider(providerId: string) {
    return this.prisma.service.findMany({
      where: {
        providerId,
      },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            avatarSeed: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            avatarSeed: true,
            email: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, providerId: string) {
    // Vérifier que le service appartient au provider
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }

    if (service.providerId !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce service');
    }

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            avatarSeed: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, providerId: string) {
    // Vérifier que le service appartient au provider
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }

    if (service.providerId !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce service');
    }

    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByCategory(category: string, pagination?: PaginationQuery): Promise<PaginatedResponse<any>> {
    const page = pagination?.page || 1;
    const limit = Math.min(100, Math.max(1, pagination?.limit || 10));
    const skip = (page - 1) * limit;

    const where = {
      category,
      isActive: true,
    };

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          provider: {
            select: {
              id: true,
              username: true,
              avatarSeed: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async search(searchDto: SearchServicesDto): Promise<PaginatedResponse<any>> {
    const page = searchDto.page || 1;
    const limit = Math.min(100, Math.max(1, searchDto.limit || 10));
    const skip = (page - 1) * limit;

    // Construire les conditions de recherche
    const where: any = {
      isActive: true,
    };

    // Recherche par mots-clés (title ou description)
    // Note: SQLite ne supporte pas mode: 'insensitive', on utilise contains
    if (searchDto.search) {
      const searchLower = searchDto.search.toLowerCase();
      where.OR = [
        { title: { contains: searchDto.search } },
        { description: { contains: searchDto.search } },
      ];
    }

    // Filtre par catégorie
    if (searchDto.category) {
      where.category = searchDto.category;
    }

    // Filtre par prix
    if (searchDto.minPrice !== undefined || searchDto.maxPrice !== undefined) {
      where.pricePerHour = {};
      if (searchDto.minPrice !== undefined) {
        where.pricePerHour.gte = searchDto.minPrice;
      }
      if (searchDto.maxPrice !== undefined) {
        where.pricePerHour.lte = searchDto.maxPrice;
      }
    }

    // Récupérer tous les services correspondants avec leurs reviews
    const services = await this.prisma.service.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            avatarSeed: true,
            email: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculer la note moyenne pour chaque service
    const servicesWithRating = services.map((service) => {
      const ratings = service.reviews.map((r) => r.rating);
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

      return {
        ...service,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: ratings.length,
      };
    });

    // Filtrer par note minimale si spécifiée
    let filteredServices = servicesWithRating;
    if (searchDto.minRating !== undefined) {
      filteredServices = servicesWithRating.filter(
        (service) => service.averageRating >= searchDto.minRating!,
      );
    }

    // Trier les résultats
    const sortBy = searchDto.sortBy || SortBy.CREATED_AT;
    const sortOrder = searchDto.sortOrder || SortOrder.DESC;

    filteredServices.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case SortBy.PRICE:
          comparison = a.pricePerHour - b.pricePerHour;
          break;
        case SortBy.RATING:
          comparison = a.averageRating - b.averageRating;
          break;
        case SortBy.TITLE:
          comparison = a.title.localeCompare(b.title);
          break;
        case SortBy.CREATED_AT:
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }

      return sortOrder === SortOrder.ASC ? comparison : -comparison;
    });

    // Pagination
    const total = filteredServices.length;
    const paginatedServices = filteredServices.slice(skip, skip + limit);

    // Retirer les reviews du résultat final (on garde seulement averageRating et reviewCount)
    const result = paginatedServices.map(({ reviews, ...service }) => service);

    const totalPages = Math.ceil(total / limit);

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
