import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

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

  async findAll() {
    return this.prisma.service.findMany({
      where: {
        isActive: true,
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
    return this.prisma.service.findUnique({
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
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, providerId: string) {
    // Vérifier que le service appartient au provider
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service || service.providerId !== providerId) {
      throw new Error('Service non trouvé ou non autorisé');
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

    if (!service || service.providerId !== providerId) {
      throw new Error('Service non trouvé ou non autorisé');
    }

    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByCategory(category: string) {
    return this.prisma.service.findMany({
      where: {
        category,
        isActive: true,
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
}
