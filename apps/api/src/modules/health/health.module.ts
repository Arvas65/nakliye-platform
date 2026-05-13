import { Controller, Get, Module, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@ApiExcludeController()
@Public()
@Controller({ path: 'health', version: VERSION_NEUTRAL })
class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{ status: string; timestamp: string; db: string; uptime: number }> {
    let dbStatus = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
    } catch {
      // sessiz geç — döneceğimiz status zaten gösterecek
    }
    return {
      status: dbStatus === 'up' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      db: dbStatus,
      uptime: process.uptime(),
    };
  }
}

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
