import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async transferCredits(createTransactionDto: CreateTransactionDto) {
    const { senderId, receiverId, amount, description } = createTransactionDto;

    // Transfert de crédits - J'ai découvert les transactions atomiques !
    // Avant j'avais des bugs bizarres où l'argent disparaissait parfois
    // Maintenant avec $transaction, tout est cohérent
    return this.prisma.$transaction(async (tx) => {
      // TRANSACTION ATOMIQUE - J'ai appris que c'est super important !
      // Si une étape échoue, tout est annulé (ROLLBACK)

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

  async findAll() {
    return this.prisma.creditTransaction.findMany({
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
    });
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