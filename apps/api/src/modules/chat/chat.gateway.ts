import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

interface AuthedSocket extends Socket {
  data: { userId?: string; email?: string };
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: AuthedSocket): Promise<void> {
    try {
      const token = (client.handshake.auth?.token ??
        client.handshake.headers.authorization?.replace('Bearer ', '')) as string | undefined;
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string }>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      client.data.userId = payload.sub;
      client.data.email = payload.email;
      client.join(`user:${payload.sub}`);
      this.logger.log(`🔌 Socket bağlandı: ${payload.email}`);
    } catch (err) {
      this.logger.warn(`Socket auth başarısız: ${(err as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthedSocket): void {
    if (client.data.email) {
      this.logger.log(`🔌 Socket koptu: ${client.data.email}`);
    }
  }

  @SubscribeMessage('join-conversation')
  handleJoin(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthedSocket,
  ): void {
    client.join(`conv:${data.conversationId}`);
  }

  @SubscribeMessage('leave-conversation')
  handleLeave(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthedSocket,
  ): void {
    client.leave(`conv:${data.conversationId}`);
  }

  @SubscribeMessage('send-message')
  async handleSend(
    @MessageBody() data: { conversationId: string; payload: SendMessageDto },
    @ConnectedSocket() client: AuthedSocket,
  ): Promise<void> {
    if (!client.data.userId) {
      return;
    }
    const message = await this.chatService.sendMessage(
      client.data.userId,
      data.conversationId,
      data.payload,
    );
    this.server.to(`conv:${data.conversationId}`).emit('new-message', message);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthedSocket,
  ): void {
    client.to(`conv:${data.conversationId}`).emit('typing', {
      userId: client.data.userId,
      isTyping: data.isTyping,
    });
  }
}
