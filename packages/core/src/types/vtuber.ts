import { z } from 'zod';

export const CreateVtuberSchema = z.object({
  name: z.string().min(1, 'VTuber名を入力してください').max(50, 'VTuber名は50文字以内で入力してください'),
  displayName: z.string().min(1, '表示名を入力してください').max(100, '表示名は100文字以内で入力してください'),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
  avatarUrl: z.string().url('有効なURLを入力してください').optional(),
  userId: z.string(),
});

export const UpdateVtuberSchema = z.object({
  name: z.string().min(1, 'VTuber名を入力してください').max(50, 'VTuber名は50文字以内で入力してください').optional(),
  displayName: z.string().min(1, '表示名を入力してください').max(100, '表示名は100文字以内で入力してください').optional(),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
  avatarUrl: z.string().url('有効なURLを入力してください').optional(),
  isActive: z.boolean().optional(),
});

export type CreateVtuberInput = z.infer<typeof CreateVtuberSchema>;
export type UpdateVtuberInput = z.infer<typeof UpdateVtuberSchema>;

export interface Vtuber {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}