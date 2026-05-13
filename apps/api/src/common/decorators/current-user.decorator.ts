import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  sub: string;
  email: string;
  role: 'CARGO_OWNER' | 'TRANSPORTER' | 'ADMIN';
}

/**
 * @CurrentUser() user: CurrentUserPayload   şeklinde kullanılır.
 * AuthGuard tarafından request.user'a koyulan payload'u verir.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as CurrentUserPayload;
  },
);
