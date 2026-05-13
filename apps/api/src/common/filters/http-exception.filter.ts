import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
  requestId?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.mapException(exception);

    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
      requestId: (request.headers['x-request-id'] as string) ?? undefined,
    };

    if (statusCode >= 500) {
      this.logger.error(
        { err: exception, request: { method: request.method, url: request.url } },
        'Sunucu hatası',
      );
    }

    response.status(statusCode).json(errorResponse);
  }

  private mapException(exception: unknown): {
    statusCode: number;
    message: string | string[];
    error: string;
  } {
    // NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return { statusCode: status, message: res, error: HttpStatus[status] ?? 'Error' };
      }
      const resObj = res as { message?: string | string[]; error?: string };
      return {
        statusCode: status,
        message: resObj.message ?? exception.message,
        error: resObj.error ?? HttpStatus[status] ?? 'Error',
      };
    }

    // Prisma bilinen hatalar
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return {
            statusCode: HttpStatus.CONFLICT,
            message: 'Bu kayıt zaten mevcut.',
            error: 'Conflict',
          };
        case 'P2025':
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Kayıt bulunamadı.',
            error: 'Not Found',
          };
        default:
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Veritabanı hatası: ${exception.code}`,
            error: 'Bad Request',
          };
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Geçersiz veri.',
        error: 'Bad Request',
      };
    }

    // Bilinmeyen
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Beklenmedik bir hata oluştu.',
      error: 'Internal Server Error',
    };
  }
}
