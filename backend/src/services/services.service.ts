import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginatedResponse, PaginationQuery } from '../common/interfaces/paginated-response.interface';

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
}
