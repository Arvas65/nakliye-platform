import { z } from 'zod';
import { userRoleSchema } from './common';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  role: userRoleSchema,
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/)
    .optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CARGO_OWNER' | 'TRANSPORTER' | 'ADMIN';
  avatarUrl?: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends TokenPair {
  user: AuthUser;
}
