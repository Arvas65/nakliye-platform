import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface AuthMeta {
  ip?: string;
  userAgent?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type SafeUser = Omit<User, 'passwordHash' | 'twoFactorSecret'>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ---------- Public API ----------

  async register(dto: RegisterDto, meta: AuthMeta): Promise<TokenPair & { user: SafeUser }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Bu email zaten kayıtlı.');
    }

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        profile: { create: {} },
      },
    });

    const tokens = await this.issueTokens(user, meta);
    this.logger.log(`Yeni kullanıcı kaydı: ${user.email} (${user.role})`);
    return { ...tokens, user: this.toSafeUser(user) };
  }

  async login(dto: LoginDto, meta: AuthMeta): Promise<TokenPair & { user: SafeUser }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.status === 'DELETED' || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Geçersiz email veya şifre.');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Geçersiz email veya şifre.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: meta.ip ?? null },
    });

    const tokens = await this.issueTokens(user, meta);
    return { ...tokens, user: this.toSafeUser(user) };
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async refreshTokens(
    userId: string,
    presentedRefreshToken: string,
    meta: AuthMeta,
  ): Promise<TokenPair> {
    const tokenHash = this.hashToken(presentedRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.userId !== userId) {
      throw new ForbiddenException('Geçersiz refresh token.');
    }
    if (stored.revokedAt) {
      // Token reuse detection — tüm session'ları iptal et
      this.logger.warn(`⚠️  Refresh token yeniden kullanım tespit edildi: user=${userId}`);
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new ForbiddenException('Token iptal edilmiş. Lütfen tekrar giriş yapın.');
    }
    if (stored.expiresAt < new Date()) {
      throw new ForbiddenException('Refresh token süresi dolmuş.');
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const tokens = await this.issueTokens(user, meta);

    // Rotation: eski token'ı iptal et, yenisini bağla
    const newHash = this.hashToken(tokens.refreshToken);
    const newRecord = await this.prisma.refreshToken.findUnique({ where: { tokenHash: newHash } });
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedById: newRecord?.id ?? null },
    });

    return tokens;
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { profile: true },
    });
    return this.toSafeUser(user);
  }

  // ---------- Helpers ----------

  private async issueTokens(user: User, meta: AuthMeta): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Veritabanına hash olarak kaydet (token'ın kendisini saklamıyoruz)
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    const refreshDays = this.parseDurationToDays(
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    );
    expiresAt.setDate(expiresAt.getDate() + refreshDays);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseDurationToDays(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7;
    const [, amount, unit] = match;
    const n = Number(amount);
    switch (unit) {
      case 'd':
        return n;
      case 'h':
        return Math.max(1, Math.ceil(n / 24));
      default:
        return 7;
    }
  }

  private toSafeUser(user: User & { profile?: unknown }): SafeUser {
    const { passwordHash, twoFactorSecret, ...safe } = user;
    void passwordHash;
    void twoFactorSecret;
    return safe as SafeUser;
  }
}
