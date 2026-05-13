import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, vehicles: true },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    const { passwordHash, twoFactorSecret, ...safe } = user;
    void passwordHash;
    void twoFactorSecret;
    return safe;
  }

  async findPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            companyName: true,
            city: true,
            yearsOfExperience: true,
            bio: true,
            averageRating: true,
            reviewCount: true,
            completedJobs: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.userProfile.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }
}
