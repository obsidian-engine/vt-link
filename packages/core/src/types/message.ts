import { z } from 'zod';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  STICKER = 'STICKER',
}

export enum MessageStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export const CreateMessageSchema = z.object({
  content: z.string().min(1, 'メッセージ内容を入力してください').max(5000, 'メッセージは5000文字以内で入力してください'),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT),
  scheduledAt: z.date().optional(),
  lineAccountId: z.string().optional(),
  messageGroupId: z.string().optional(),
  fanId: z.string().optional(),
});

export const UpdateMessageSchema = z.object({
  content: z.string().min(1, 'メッセージ内容を入力してください').max(5000, 'メッセージは5000文字以内で入力してください').optional(),
  type: z.nativeEnum(MessageType).optional(),
  status: z.nativeEnum(MessageStatus).optional(),
  scheduledAt: z.date().optional(),
});

export const CreateMessageGroupSchema = z.object({
  name: z.string().min(1, 'グループ名を入力してください').max(100, 'グループ名は100文字以内で入力してください'),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
  vtuberId: z.string(),
});

export const UpdateMessageGroupSchema = z.object({
  name: z.string().min(1, 'グループ名を入力してください').max(100, 'グループ名は100文字以内で入力してください').optional(),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
});

export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;
export type UpdateMessageInput = z.infer<typeof UpdateMessageSchema>;
export type CreateMessageGroupInput = z.infer<typeof CreateMessageGroupSchema>;
export type UpdateMessageGroupInput = z.infer<typeof UpdateMessageGroupSchema>;

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  lineAccountId: string | null;
  messageGroupId: string | null;
  fanId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageGroup {
  id: string;
  name: string;
  description: string | null;
  vtuberId: string;
  createdAt: Date;
  updatedAt: Date;
}