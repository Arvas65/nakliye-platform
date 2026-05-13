import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Bu decorator ile işaretlenen endpoint'ler JwtAuthGuard tarafından
 * atlanır — yani auth gerektirmez.
 *
 * @Public()
 * @Post('login')
 * login() {}
 */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
