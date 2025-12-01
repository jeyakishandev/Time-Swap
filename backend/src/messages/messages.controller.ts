import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  @Post()
  async create(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    // S'assurer qu'on n'a que les champs attendus (éviter l'injection de createdAt, etc.)
    // Le ValidationPipe global avec whitelist: true devrait déjà filtrer les champs non autorisés
    const cleanDto: CreateMessageDto = {
      receiverId: String(createMessageDto.receiverId).trim(),
      content: String(createMessageDto.content).trim(),
    };
    
    const message = await this.messagesService.create(req.user.sub, cleanDto);
    // Émettre le message via WebSocket
    this.messagesGateway.emitNewMessage(message);
    return message;
  }

  @Get('conversations')
  getConversations(@Request() req) {
    return this.messagesService.getConversations(req.user.sub);
  }

  @Get('conversations/:userId')
  getConversation(@Request() req, @Param('userId') userId: string) {
    return this.messagesService.getConversation(req.user.sub, userId);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.messagesService.getUnreadCount(req.user.sub).then(count => ({ count }));
  }

  @Patch(':id/read')
  markAsRead(@Request() req, @Param('id') id: string) {
    return this.messagesService.markAsRead(id, req.user.sub);
  }

  @Patch('conversations/:userId/read')
  markConversationAsRead(@Request() req, @Param('userId') userId: string) {
    return this.messagesService.markConversationAsRead(req.user.sub, userId);
  }

  @Delete(':id')
  deleteMessage(@Request() req, @Param('id') id: string) {
    return this.messagesService.deleteMessage(id, req.user.sub);
  }
}

