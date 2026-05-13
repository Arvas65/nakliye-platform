import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CargoStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { ListCargoQueryDto } from './dto/list-cargo-query.dto';

@Injectable()
export class CargoService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListCargoQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);

    const where: Prisma.CargoPostWhereInput = {
      status: query.status ?? CargoStatus.OPEN,
      ...(query.pickupCity && { pickupCity: { contains: query.pickupCity, mode: 'insensitive' } }),
      ...(query.dropoffCity && {
        dropoffCity: { contains: query.dropoffCity, mode: 'insensitive' },
      }),
      ...(query.cargoType && { cargoType: query.cargoType }),
      ...(query.minBudget && { budget: { gte: query.minBudget } }),
      ...(query.maxBudget && { budget: { lte: query.maxBudget } }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.cargoPost.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              profile: { select: { companyName: true, averageRating: true } },
            },
          },
          _count: { select: { offers: true } },
        },
      }),
      this.prisma.cargoPost.count({ where }),
    ]);

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: string) {
    const cargo = await this.prisma.cargoPost.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            profile: { select: { companyName: true, averageRating: true, reviewCount: true } },
          },
        },
        offers: {
          include: {
            transporter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                profile: { select: { averageRating: true, completedJobs: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!cargo) throw new NotFoundException('İlan bulunamadı.');

    // view sayacı artır (async, throw etmesin)
    this.prisma.cargoPost
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch(() => null);

    return cargo;
  }

  async create(ownerId: string, dto: CreateCargoDto) {
    return this.prisma.cargoPost.create({
      data: { ...dto, ownerId, status: CargoStatus.OPEN },
    });
  }

  async update(ownerId: string, id: string, dto: UpdateCargoDto) {
    const cargo = await this.prisma.cargoPost.findUnique({ where: { id } });
    if (!cargo) throw new NotFoundException('İlan bulunamadı.');
    if (cargo.ownerId !== ownerId) {
      throw new ForbiddenException('Bu ilanı güncelleyemezsiniz.');
    }
    if (cargo.status !== CargoStatus.OPEN && cargo.status !== CargoStatus.DRAFT) {
      throw new ForbiddenException('Sadece OPEN/DRAFT durumdaki ilanlar güncellenebilir.');
    }
    return this.prisma.cargoPost.update({ where: { id }, data: dto });
  }

  async cancel(ownerId: string, id: string) {
    const cargo = await this.prisma.cargoPost.findUnique({ where: { id } });
    if (!cargo) throw new NotFoundException('İlan bulunamadı.');
    if (cargo.ownerId !== ownerId) throw new ForbiddenException('Yetkiniz yok.');
    return this.prisma.cargoPost.update({
      where: { id },
      data: { status: CargoStatus.CANCELLED, cancelledAt: new Date() },
    });
  }

  async findByOwner(ownerId: string) {
    return this.prisma.cargoPost.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { offers: true } } },
    });
  }
}
