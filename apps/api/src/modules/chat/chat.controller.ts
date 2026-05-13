import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('chat')
@ApiBearerAuth('access-token')
@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Konuşmalarım' })
  listConversations(@CurrentUser() user: CurrentUserPayload) {
    return this.chatService.listConversations(user.sub);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Konuşma mesajları (sayfalı)' })
  listMessages(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') conversationId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.chatService.listMessages(user.sub, conversationId, cursor);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Yeni konuşma başlat (veya mevcudu döner)' })
  start(
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: { participantId: string; cargoPostId?: string },
  ) {
    return this.chatService.findOrCreateConversation(
      user.sub,
      body.participantId,
      body.cargoPostId,
    );
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Mesaj gönder (REST fallback)' })
  send(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user.sub, conversationId, dto);
  }
}
