import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createBookingDto: CreateBookingDto, clientId: string) {
    const { serviceId, hours, notes, scheduledAt } = createBookingDto;

    // Vérifier que le service existe
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: true }
    });

    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }

    if (!service.isActive) {
      throw new BadRequestException('Ce service n\'est plus disponible');
    }

    if (service.providerId === clientId) {
      throw new BadRequestException('Vous ne pouvez pas réserver votre propre service');
    }

    // Calculer le prix total
    const totalPrice = service.pricePerHour * hours;

    // Vérifier que le client a assez de crédits
    const client = await this.prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      throw new NotFoundException('Client non trouvé');
    }

    if (client.credits < totalPrice) {
      throw new BadRequestException('Crédits insuffisants');
    }

    // Créer la réservation
    const booking = await this.prisma.booking.create({
      data: {
        clientId,
        serviceId,
        providerId: service.providerId,
        hours,
        totalPrice,
        notes,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        provider: { select: { id: true, username: true, email: true } }
      }
    });

    // Envoyer une notification au prestataire
    const notification = await this.notificationsService.createBookingRequestNotification(
      booking.providerId,
      booking.client.username,
      booking.service.title,
    );

    // Envoyer la notification en temps réel via WebSocket
    await this.notificationsGateway.sendNotificationToUser(booking.providerId, notification);

    return booking;
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        provider: { select: { id: true, username: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        provider: { select: { id: true, username: true, email: true } }
      }
    });

    if (!booking) {
      throw new NotFoundException('Réservation non trouvée');
    }

    return booking;
  }

  async findByUser(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        OR: [
          { clientId: userId },
          { providerId: userId }
        ]
      },
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        provider: { select: { id: true, username: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId: string) {
    const booking = await this.findOne(id);

    // Vérifier que l'utilisateur peut modifier cette réservation
    if (booking.clientId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException('Vous n\'avez pas le droit de modifier cette réservation');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        provider: { select: { id: true, username: true, email: true } }
      }
    });

    return updatedBooking;
  }

  async confirm(id: string, providerId: string) {
    const booking = await this.findOne(id);

    if (booking.providerId !== providerId) {
      throw new ForbiddenException('Seul le prestataire peut confirmer cette réservation');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Cette réservation ne peut plus être confirmée');
    }

    // Vérifier que le client a toujours assez de crédits
    const client = await this.prisma.user.findUnique({
      where: { id: booking.clientId }
    });

    if (!client) {
      throw new NotFoundException('Client non trouvé');
    }

    if (client.credits < booking.totalPrice) {
      throw new BadRequestException('Le client n\'a plus assez de crédits');
    }

    // Confirmer la réservation et déduire les crédits
    return this.prisma.$transaction(async (tx) => {
      // Déduire les crédits du client
      await tx.user.update({
        where: { id: booking.clientId },
        data: { credits: { decrement: booking.totalPrice } }
      });

      // Ajouter les crédits au prestataire
      await tx.user.update({
        where: { id: booking.providerId },
        data: { credits: { increment: booking.totalPrice } }
      });

      // Créer une transaction de crédit
      await tx.creditTransaction.create({
        data: {
          amount: booking.totalPrice,
          description: `Paiement pour le service: ${booking.service.title}`,
          status: 'COMPLETED',
          senderId: booking.clientId,
          receiverId: booking.providerId
        }
      });

      // Mettre à jour le statut de la réservation
      const confirmedBooking = await tx.booking.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: {
          client: { select: { id: true, username: true, email: true } },
          service: { select: { id: true, title: true, description: true } },
          provider: { select: { id: true, username: true, email: true } }
        }
      });

      return confirmedBooking;
    }, {
      timeout: 10000, // 10 secondes au lieu de 5
    }).then(async (confirmedBooking) => {
      // Envoyer des notifications après la transaction (en dehors de la transaction)
      try {
        const clientNotification = await this.notificationsService.createBookingConfirmedNotification(
          confirmedBooking.clientId,
          confirmedBooking.service.title,
        );

        const providerNotification = await this.notificationsService.createPaymentReceivedNotification(
          confirmedBooking.providerId,
          confirmedBooking.totalPrice,
          confirmedBooking.service.title,
        );

        // Envoyer les notifications en temps réel
        await this.notificationsGateway.sendNotificationToUser(confirmedBooking.clientId, clientNotification);
        await this.notificationsGateway.sendNotificationToUser(confirmedBooking.providerId, providerNotification);
      } catch (notificationError) {
        console.error('Erreur lors de l\'envoi des notifications:', notificationError);
        // Ne pas faire échouer la confirmation si les notifications échouent
      }

      return confirmedBooking;
    });
  }

  async cancel(id: string, userId: string) {
    const booking = await this.findOne(id);

    // Vérifier que l'utilisateur peut annuler cette réservation
    if (booking.clientId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException('Vous n\'avez pas le droit d\'annuler cette réservation');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cette réservation est déjà terminée');
    }

    // Si la réservation était confirmée, rembourser les crédits
    if (booking.status === 'CONFIRMED') {
      return this.prisma.$transaction(async (tx) => {
        // Rembourser le client
        await tx.user.update({
          where: { id: booking.clientId },
          data: { credits: { increment: booking.totalPrice } }
        });

        // Déduire du prestataire
        await tx.user.update({
          where: { id: booking.providerId },
          data: { credits: { decrement: booking.totalPrice } }
        });

        // Créer une transaction de remboursement
        await tx.creditTransaction.create({
          data: {
            amount: booking.totalPrice,
            description: `Remboursement pour l'annulation du service: ${booking.service.title}`,
            status: 'COMPLETED',
            senderId: booking.providerId,
            receiverId: booking.clientId
          }
        });

        // Annuler la réservation
        return tx.booking.update({
          where: { id },
          data: { status: 'CANCELLED' },
          include: {
            client: { select: { id: true, username: true, email: true } },
            service: { select: { id: true, title: true, description: true } },
            provider: { select: { id: true, username: true, email: true } }
          }
        });
      });
    }

    // Annuler une réservation en attente
    return this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        provider: { select: { id: true, username: true, email: true } }
      }
    });
  }

  async complete(id: string, providerId: string) {
    const booking = await this.findOne(id);

    if (booking.providerId !== providerId) {
      throw new ForbiddenException('Seul le prestataire peut marquer cette réservation comme terminée');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Cette réservation doit être confirmée avant d\'être marquée comme terminée');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, description: true } },
        provider: { select: { id: true, username: true, email: true } }
      }
    });
  }

  async remove(id: string, userId: string) {
    const booking = await this.findOne(id);

    // Vérifier que l'utilisateur peut supprimer cette réservation
    if (booking.clientId !== userId && booking.providerId !== userId) {
      throw new ForbiddenException('Vous n\'avez pas le droit de supprimer cette réservation');
    }

    return this.prisma.booking.delete({
      where: { id }
    });
  }
}
