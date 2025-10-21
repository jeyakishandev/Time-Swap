import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub || payload.userId;
      
      if (client.userId) {
        this.connectedUsers.set(client.userId, client);
      }
      
      if (client.userId) {
        console.log(`User ${client.userId} connected to notifications`);
      }
    } catch (error) {
      console.log('Invalid token for WebSocket connection');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`User ${client.userId} disconnected from notifications`);
    }
  }

  // Envoyer une notification à un utilisateur spécifique
  async sendNotificationToUser(userId: string, notification: any) {
    const client = this.connectedUsers.get(userId);
    if (client) {
      client.emit('new-notification', notification);
      console.log(`Notification sent to user ${userId}: ${notification.title}`);
    }
  }

  // Envoyer une notification à tous les utilisateurs connectés
  async broadcastNotification(notification: any) {
    this.connectedUsers.forEach((client, userId) => {
      client.emit('new-notification', notification);
    });
    console.log(`Broadcast notification: ${notification.title}`);
  }

  @SubscribeMessage('join-notifications')
  async handleJoinNotifications(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.userId) {
      client.join(`user-${client.userId}`);
      console.log(`User ${client.userId} joined notifications room`);
    }
  }

  @SubscribeMessage('mark-notification-read')
  async handleMarkNotificationRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (client.userId) {
      try {
        await this.notificationsService.markAsRead(data.notificationId, client.userId);
        client.emit('notification-marked-read', { notificationId: data.notificationId });
      } catch (error) {
        client.emit('error', { message: 'Failed to mark notification as read' });
      }
    }
  }
}
