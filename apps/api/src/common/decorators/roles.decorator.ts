import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Endpoint için izin verilen kullanıcı rollerini tanımlar.
 *
 * @Roles(UserRole.ADMIN)
 * @Get('admin-only')
 */
export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
