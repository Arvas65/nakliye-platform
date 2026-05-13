import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MessageType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async listConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async findOrCreateConversation(userId: string, otherUserId: string, cargoPostId?: string) {
    // Aynı iki kullanıcı ve cargo arasında konuşma var mı?
    const existing = await this.prisma.conversation.findFirst({
      where: {
        cargoPostId: cargoPostId ?? null,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        cargoPostId,
        participants: { create: [{ userId }, { userId: otherUserId }] },
      },
    });
  }

  async listMessages(userId: string, conversationId: string, cursor?: string) {
    await this.ensureParticipant(userId, conversationId);
    return this.prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    });
  }

  async sendMessage(userId: string, conversationId: string, dto: SendMessageDto) {
    await this.ensureParticipant(userId, conversationId);
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        type: dto.type ?? MessageType.TEXT,
        content: dto.content,
        metadata: (dto.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
    return message;
  }

  private async ensureParticipant(userId: string, conversationId: string): Promise<void> {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) {
      const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conv) throw new NotFoundException('Konuşma bulunamadı.');
      throw new ForbiddenException('Bu konuşmaya erişiminiz yok.');
    }
  }
}
