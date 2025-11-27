import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PaginatedResponse, PaginationQuery } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async transferCredits(createTransactionDto: CreateTransactionDto) {
    const { senderId, receiverId, amount, description } = createTransactionDto;

    // Vérifier que l'expéditeur et le destinataire sont différents
    if (senderId === receiverId) {
      throw new BadRequestException('Vous ne pouvez pas transférer des crédits à vous-même');
    }

    // Transfert de crédits avec transaction atomique pour garantir la cohérence des données
    return this.prisma.$transaction(async (tx) => {
      // TRANSACTION ATOMIQUE - Si une étape échoue, tout est annulé (ROLLBACK)

      // Vérifier que l'expéditeur existe et a assez de crédits
      const sender = await tx.user.findUnique({
        where: { id: senderId },
      });

      if (!sender) {
        throw new NotFoundException('Expéditeur non trouvé');
      }

      // Conversion en Number car SQLite ne gère pas les Decimal comme PostgreSQL
      const senderCredits = Number(sender.credits);
      const transferAmount = Number(amount);

      if (senderCredits < transferAmount) {
        throw new BadRequestException('Crédits insuffisants');
      }

      // Vérifier que le destinataire existe
      const receiver = await tx.user.findUnique({
        where: { id: receiverId },
      });

      if (!receiver) {
        throw new NotFoundException('Destinataire non trouvé');
      }

      // Mettre à jour les crédits de l'expéditeur
      await tx.user.update({
        where: { id: senderId },
        data: { credits: senderCredits - transferAmount },
      });

      // Mettre à jour les crédits du destinataire
      await tx.user.update({
        where: { id: receiverId },
        data: { credits: Number(receiver.credits) + transferAmount },
      });

      // Créer la transaction
      const result = await tx.creditTransaction.create({
        data: {
          amount: transferAmount,
          description,
          status: 'COMPLETED',
          senderId,
          receiverId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      // TODO: Améliorer les notifications plus tard
      // Pour l'instant, juste un console.log
      console.log(`Transaction ${result.id} completed: ${result.amount} credits transferred`);

      return result;
    });
  }

  async findAll(pagination?: PaginationQuery): Promise<PaginatedResponse<any>> {
    const page = pagination?.page || 1;
    const limit = Math.min(100, Math.max(1, pagination?.limit || 10));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.creditTransaction.findMany({
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          receiver: {
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
      this.prisma.creditTransaction.count(),
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

  async findByUser(userId: string, pagination?: PaginationQuery): Promise<PaginatedResponse<any>> {
    const page = pagination?.page || 1;
    const limit = Math.min(100, Math.max(1, pagination?.limit || 10));
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.creditTransaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          receiver: {
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
      this.prisma.creditTransaction.count({ where }),
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

  async findOne(id: string) {
    return this.prisma.creditTransaction.findUnique({
      where: { id },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }
}