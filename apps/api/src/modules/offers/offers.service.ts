import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CargoStatus, OfferStatus, ShipmentStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(transporterId: string, dto: CreateOfferDto) {
    const cargo = await this.prisma.cargoPost.findUnique({
      where: { id: dto.cargoPostId },
    });
    if (!cargo) throw new NotFoundException('İlan bulunamadı.');
    if (cargo.status !== CargoStatus.OPEN) {
      throw new BadRequestException('Sadece açık ilanlara teklif verilebilir.');
    }
    if (cargo.ownerId === transporterId) {
      throw new ForbiddenException('Kendi ilanınıza teklif veremezsiniz.');
    }

    try {
      const offer = await this.prisma.$transaction(async (tx) => {
        const created = await tx.offer.create({
          data: {
            cargoPostId: dto.cargoPostId,
            transporterId,
            vehicleId: dto.vehicleId,
            amount: dto.amount,
            currency: dto.currency ?? cargo.currency,
            message: dto.message,
            etaPickupAt: dto.etaPickupAt ? new Date(dto.etaPickupAt) : null,
            etaDeliveryAt: dto.etaDeliveryAt ? new Date(dto.etaDeliveryAt) : null,
            validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
          },
        });
        await tx.cargoPost.update({
          where: { id: dto.cargoPostId },
          data: { offerCount: { increment: 1 } },
        });
        return created;
      });
      return offer;
    } catch (err) {
      if ((err as { code?: string }).code === 'P2002') {
        throw new ConflictException('Bu ilana zaten bir teklifiniz var.');
      }
      throw err;
    }
  }

  async findByUser(userId: string, role: UserRole) {
    if (role === UserRole.TRANSPORTER) {
      return this.prisma.offer.findMany({
        where: { transporterId: userId },
        include: { cargoPost: true },
        orderBy: { createdAt: 'desc' },
      });
    }
    // CARGO_OWNER: kendi ilanlarına gelen teklifler
    return this.prisma.offer.findMany({
      where: { cargoPost: { ownerId: userId } },
      include: { cargoPost: true, transporter: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async accept(ownerId: string, offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { cargoPost: true },
    });
    if (!offer) throw new NotFoundException('Teklif bulunamadı.');
    if (offer.cargoPost.ownerId !== ownerId) {
      throw new ForbiddenException('Yetkiniz yok.');
    }
    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Sadece bekleyen teklifler kabul edilebilir.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Bu teklifi accept et
      const accepted = await tx.offer.update({
        where: { id: offerId },
        data: { status: OfferStatus.ACCEPTED, respondedAt: new Date() },
      });
      // Aynı ilana gelen diğer pending teklifleri reject et
      await tx.offer.updateMany({
        where: {
          cargoPostId: offer.cargoPostId,
          id: { not: offerId },
          status: OfferStatus.PENDING,
        },
        data: { status: OfferStatus.REJECTED, respondedAt: new Date() },
      });
      // İlanı MATCHED yap
      await tx.cargoPost.update({
        where: { id: offer.cargoPostId },
        data: { status: CargoStatus.MATCHED, acceptedOfferId: offerId },
      });
      // Shipment kaydını oluştur
      await tx.shipment.create({
        data: {
          cargoPostId: offer.cargoPostId,
          ownerId: offer.cargoPost.ownerId,
          carrierId: offer.transporterId,
          vehicleId: offer.vehicleId,
          status: ShipmentStatus.SCHEDULED,
        },
      });
      return accepted;
    });
  }

  async reject(ownerId: string, offerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { cargoPost: true },
    });
    if (!offer) throw new NotFoundException('Teklif bulunamadı.');
    if (offer.cargoPost.ownerId !== ownerId) {
      throw new ForbiddenException('Yetkiniz yok.');
    }
    return this.prisma.offer.update({
      where: { id: offerId },
      data: { status: OfferStatus.REJECTED, respondedAt: new Date() },
    });
  }

  async withdraw(transporterId: string, offerId: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Teklif bulunamadı.');
    if (offer.transporterId !== transporterId) {
      throw new ForbiddenException('Yetkiniz yok.');
    }
    if (offer.status !== OfferStatus.PENDING) {
      throw new BadRequestException('Sadece bekleyen teklifler geri çekilebilir.');
    }
    return this.prisma.offer.update({
      where: { id: offerId },
      data: { status: OfferStatus.WITHDRAWN, respondedAt: new Date() },
    });
  }
}
