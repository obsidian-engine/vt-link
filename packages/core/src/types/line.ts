import { z } from 'zod';

export const CreateLineAccountSchema = z.object({
  channelId: z.string().min(1, 'チャネルIDを入力してください'),
  channelSecret: z.string().min(1, 'チャネルシークレットを入力してください'),
  channelAccessToken: z.string().min(1, 'チャネルアクセストークンを入力してください'),
  displayName: z.string().min(1, '表示名を入力してください').max(100, '表示名は100文字以内で入力してください'),
  pictureUrl: z.string().url('有効なURLを入力してください').optional(),
  vtuberId: z.string(),
});

export const UpdateLineAccountSchema = z.object({
  channelSecret: z.string().min(1, 'チャネルシークレットを入力してください').optional(),
  channelAccessToken: z.string().min(1, 'チャネルアクセストークンを入力してください').optional(),
  displayName: z.string().min(1, '表示名を入力してください').max(100, '表示名は100文字以内で入力してください').optional(),
  pictureUrl: z.string().url('有効なURLを入力してください').optional(),
  isActive: z.boolean().optional(),
});

export type CreateLineAccountInput = z.infer<typeof CreateLineAccountSchema>;
export type UpdateLineAccountInput = z.infer<typeof UpdateLineAccountSchema>;

export interface LineAccount {
  id: string;
  channelId: string;
  channelSecret: string;
  channelAccessToken: string;
  displayName: string;
  pictureUrl: string | null;
  isActive: boolean;
  vtuberId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Fan {
  id: string;
  lineUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
  statusMessage: string | null;
  isBlocked: boolean;
  lineAccountId: string;
  createdAt: Date;
  updatedAt: Date;
}