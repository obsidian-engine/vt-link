import { z } from 'zod';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export const CreateUserSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  name: z.string().min(1, '名前を入力してください').max(100, '名前は100文字以内で入力してください'),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1, '名前を入力してください').max(100, '名前は100文字以内で入力してください').optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}