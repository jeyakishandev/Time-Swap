import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(senderId: string, createMessageDto: CreateMessageDto) {
    // Vérifier que le destinataire existe
    const receiver = await this.prisma.user.findUnique({
      where: { id: createMessageDto.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Destinataire introuvable');
    }

    // Empêcher l'auto-envoi
    if (senderId === createMessageDto.receiverId) {
      throw new ForbiddenException('Vous ne pouvez pas vous envoyer un message à vous-même');
    }

    // Créer le message - Prisma gérera automatiquement createdAt et updatedAt
    // Utiliser un objet littéral directement dans l'appel Prisma pour éviter toute injection
    // Ne JAMAIS inclure createdAt, updatedAt, id, isRead - Prisma les gère automatiquement
    try {
      const message = await this.prisma.message.create({
        data: {
          content: createMessageDto.content.trim(),
          senderId: senderId,
          receiverId: createMessageDto.receiverId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatarSeed: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              avatarSeed: true,
              email: true,
            },
          },
        },
      });
      
      this.logger.log(`[MessagesService] Message créé avec succès: ${message.id}`);
      return message;
    } catch (error: any) {
      this.logger.error(`[MessagesService] Erreur lors de la création du message:`, error);
      throw error;
    }
  }

  async getConversation(userId: string, otherUserId: string) {
    // Vérifier que l'autre utilisateur existe
    const otherUser = await this.prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        username: true,
        avatarSeed: true,
        email: true,
      },
    });

    if (!otherUser) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Récupérer tous les messages entre les deux utilisateurs
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarSeed: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatarSeed: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Marquer les messages reçus comme lus
    await this.prisma.message.updateMany({
      where: {
        receiverId: userId,
        senderId: otherUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      otherUser,
      messages,
    };
  }

  async getConversations(userId: string) {
    // Récupérer toutes les conversations de l'utilisateur
    // Une conversation = un autre utilisateur avec qui l'utilisateur a échangé des messages
    const sentMessages = await this.prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });

    const receivedMessages = await this.prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    // Combiner les IDs uniques
    const conversationUserIds = new Set<string>();
    sentMessages.forEach((msg) => conversationUserIds.add(msg.receiverId));
    receivedMessages.forEach((msg) => conversationUserIds.add(msg.senderId));

    // Pour chaque conversation, récupérer le dernier message et le nombre de messages non lus
    const conversations = await Promise.all(
      Array.from(conversationUserIds).map(async (otherUserId) => {
        const lastMessage = await this.prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
            ],
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatarSeed: true,
                email: true,
              },
            },
            receiver: {
              select: {
                id: true,
                username: true,
                avatarSeed: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await this.prisma.message.count({
          where: {
            receiverId: userId,
            senderId: otherUserId,
            isRead: false,
          },
        });

        // Si pas de message, récupérer l'utilisateur directement
        if (!lastMessage) {
          const otherUser = await this.prisma.user.findUnique({
            where: { id: otherUserId },
            select: {
              id: true,
              username: true,
              avatarSeed: true,
              email: true,
            },
          });

          if (!otherUser) {
            return null; // Utilisateur introuvable, filtrer cette conversation
          }

          return {
            otherUser,
            lastMessage: null,
            unreadCount,
          };
        }

        const otherUser = lastMessage.senderId === userId 
          ? lastMessage.receiver 
          : lastMessage.sender;

        return {
          otherUser,
          lastMessage,
          unreadCount,
        };
      }),
    );

    // Filtrer les conversations null et trier par date du dernier message (plus récent en premier)
    const filteredConversations = conversations.filter((conv): conv is NonNullable<typeof conv> => conv !== null);
    
    filteredConversations.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
    });

    return filteredConversations;
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException('Vous ne pouvez marquer comme lus que vos propres messages reçus');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  async markConversationAsRead(userId: string, otherUserId: string) {
    return this.prisma.message.updateMany({
      where: {
        receiverId: userId,
        senderId: otherUserId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message introuvable');
    }

    // Seul l'expéditeur peut supprimer le message
    if (message.senderId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres messages');
    }

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }
}

