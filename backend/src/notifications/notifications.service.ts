import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
  ) {
    return this.prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId,
      },
    });
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limiter à 50 notifications
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.update({
      where: {
        id: notificationId,
        userId, // S'assurer que l'utilisateur peut seulement marquer ses propres notifications
      },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.delete({
      where: {
        id: notificationId,
        userId, // S'assurer que l'utilisateur peut seulement supprimer ses propres notifications
      },
    });
  }

  // Méthodes utilitaires pour créer des notifications spécifiques
  async createBookingRequestNotification(
    providerId: string,
    clientUsername: string,
    serviceTitle: string,
  ) {
    return this.createNotification(
      providerId,
      'Nouvelle demande de réservation',
      `${clientUsername} souhaite réserver votre service "${serviceTitle}"`,
      'BOOKING_REQUEST',
    );
  }

  async createBookingConfirmedNotification(
    clientId: string,
    serviceTitle: string,
  ) {
    return this.createNotification(
      clientId,
      'Réservation confirmée',
      `Votre réservation pour "${serviceTitle}" a été confirmée`,
      'BOOKING_CONFIRMED',
    );
  }

  async createBookingCancelledNotification(
    userId: string,
    serviceTitle: string,
    reason: 'client' | 'provider',
  ) {
    const title = reason === 'client' ? 'Réservation annulée' : 'Réservation annulée par le prestataire';
    const message = reason === 'client' 
      ? `Vous avez annulé votre réservation pour "${serviceTitle}"`
      : `Le prestataire a annulé votre réservation pour "${serviceTitle}"`;
    
    return this.createNotification(
      userId,
      title,
      message,
      'BOOKING_CANCELLED',
    );
  }

  async createPaymentReceivedNotification(
    providerId: string,
    amount: number,
    serviceTitle: string,
  ) {
    return this.createNotification(
      providerId,
      'Paiement reçu',
      `Vous avez reçu ${amount} crédits pour le service "${serviceTitle}"`,
      'PAYMENT_RECEIVED',
    );
  }

  async createBookingCompletedNotification(
    clientId: string,
    serviceTitle: string,
  ) {
    return this.createNotification(
      clientId,
      'Service terminé',
      `Le service "${serviceTitle}" a été marqué comme terminé`,
      'BOOKING_COMPLETED',
    );
  }

  // Notifications pour encourager les avis
  async createReviewReminderNotification(
    userId: string,
    targetUsername: string,
    serviceTitle: string,
    role: 'client' | 'provider',
  ) {
    const title = 'Donnez votre avis !';
    const message = role === 'client' 
      ? `Comment s'est passée votre expérience avec ${targetUsername} pour "${serviceTitle}" ?`
      : `Comment s'est passée votre collaboration avec ${targetUsername} pour "${serviceTitle}" ?`;
    
    return this.createNotification(
      userId,
      title,
      message,
      'REVIEW_REMINDER',
    );
  }

  async createReviewReceivedNotification(
    userId: string,
    reviewerUsername: string,
    rating: number,
    serviceTitle: string,
  ) {
    const stars = '⭐'.repeat(rating);
    return this.createNotification(
      userId,
      'Nouvel avis reçu',
      `${reviewerUsername} vous a donné ${rating}/5 ${stars} pour "${serviceTitle}"`,
      'REVIEW_RECEIVED',
    );
  }
}

