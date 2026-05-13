import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Güvenlik
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
    credentials: true,
  });

  // API versioning: /api/v1/...
  app.setGlobalPrefix('api', { exclude: ['health', 'metrics'] });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger / OpenAPI
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Nakliye Platformu API')
      .setDescription('Yük sahipleri ve nakliyecileri buluşturan pazaryeri API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'access-token',
      )
      .addTag('auth', 'Kimlik doğrulama')
      .addTag('users', 'Kullanıcı yönetimi')
      .addTag('cargo', 'Yük ilanları')
      .addTag('offers', 'Teklifler')
      .addTag('shipments', 'Taşıma süreçleri')
      .addTag('chat', 'Mesajlaşma')
      .addTag('payments', 'Ödeme & Escrow')
      .addTag('notifications', 'Bildirimler')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);

  logger.log(`🚀 Nakliye API çalışıyor: http://localhost:${port}`);
  logger.log(`📘 Swagger docs:        http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('API başlatılamadı:', err);
  process.exit(1);
});
