import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: process.env.FRONTEND_URL?.split(',').map(url => url.trim()) || 'http://localhost:3000',
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
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
        this.logger.log(`User ${client.userId} connected to messages`);
      }
    } catch (error) {
      this.logger.warn('Invalid token for WebSocket connection');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`User ${client.userId} disconnected from messages`);
    }
  }

  // Rejoindre une conversation (room)
  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @MessageBody() data: { otherUserId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Non authentifié' });
      return;
    }

    const roomId = this.getConversationRoomId(client.userId, data.otherUserId);
    client.join(roomId);
    this.logger.debug(`User ${client.userId} joined conversation room ${roomId}`);
    
    // Marquer les messages comme lus
    await this.messagesService.markConversationAsRead(client.userId, data.otherUserId);
    
    // Notifier l'autre utilisateur que les messages ont été lus
    const otherUserSocket = this.connectedUsers.get(data.otherUserId);
    if (otherUserSocket) {
      otherUserSocket.emit('messages-read', { userId: client.userId });
    }
  }

  // Quitter une conversation
  @SubscribeMessage('leave-conversation')
  async handleLeaveConversation(
    @MessageBody() data: { otherUserId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return;
    }

    const roomId = this.getConversationRoomId(client.userId, data.otherUserId);
    client.leave(roomId);
    this.logger.debug(`User ${client.userId} left conversation room ${roomId}`);
  }

  // Envoyer un message
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: { receiverId: string; content: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Non authentifié' });
      return;
    }

    try {
      // Créer le message via le service
      const message = await this.messagesService.create(client.userId, {
        receiverId: data.receiverId,
        content: data.content,
      });

      // Émettre le message à la room de conversation (pour tous les participants)
      const roomId = this.getConversationRoomId(client.userId, data.receiverId);
      this.server.to(roomId).emit('new-message', message);

      // Émettre aussi directement à l'expéditeur pour confirmation immédiate
      client.emit('new-message', message);

      // Notifier le destinataire s'il n'est pas dans la room
      const receiverSocket = this.connectedUsers.get(data.receiverId);
      if (receiverSocket) {
        receiverSocket.emit('new-message-notification', {
          message,
          unreadCount: await this.messagesService.getUnreadCount(data.receiverId),
        });
      }

      // Confirmer l'envoi à l'expéditeur
      client.emit('message-sent', message);
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit('error', { message: error.message || 'Erreur lors de l\'envoi du message' });
    }
  }

  // Marquer un message comme lu
  @SubscribeMessage('mark-message-read')
  async handleMarkMessageRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Non authentifié' });
      return;
    }

    try {
      await this.messagesService.markAsRead(data.messageId, client.userId);
      client.emit('message-marked-read', { messageId: data.messageId });
    } catch (error) {
      this.logger.error(`Error marking message as read: ${error.message}`);
      client.emit('error', { message: error.message || 'Erreur lors du marquage du message' });
    }
  }

  // Marquer une conversation comme lue
  @SubscribeMessage('mark-conversation-read')
  async handleMarkConversationRead(
    @MessageBody() data: { otherUserId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Non authentifié' });
      return;
    }

    try {
      await this.messagesService.markConversationAsRead(client.userId, data.otherUserId);
      
      // Notifier l'autre utilisateur
      const otherUserSocket = this.connectedUsers.get(data.otherUserId);
      if (otherUserSocket) {
        otherUserSocket.emit('messages-read', { userId: client.userId });
      }

      client.emit('conversation-marked-read', { otherUserId: data.otherUserId });
    } catch (error) {
      this.logger.error(`Error marking conversation as read: ${error.message}`);
      client.emit('error', { message: error.message || 'Erreur lors du marquage de la conversation' });
    }
  }

  // Obtenir le nombre de messages non lus
  @SubscribeMessage('get-unread-count')
  async handleGetUnreadCount(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      client.emit('error', { message: 'Non authentifié' });
      return;
    }

    try {
      const count = await this.messagesService.getUnreadCount(client.userId);
      client.emit('unread-count', { count });
    } catch (error) {
      this.logger.error(`Error getting unread count: ${error.message}`);
      client.emit('error', { message: error.message || 'Erreur lors de la récupération du nombre de messages non lus' });
    }
  }

  // Méthode utilitaire pour générer un ID de room de conversation
  private getConversationRoomId(userId1: string, userId2: string): string {
    // Trier les IDs pour avoir toujours le même room ID pour la même paire d'utilisateurs
    const sortedIds = [userId1, userId2].sort();
    return `conversation-${sortedIds[0]}-${sortedIds[1]}`;
  }

  // Méthode publique pour émettre un message depuis le service
  async emitNewMessage(message: any) {
    const roomId = this.getConversationRoomId(message.senderId, message.receiverId);
    this.server.to(roomId).emit('new-message', message);
  }
}

