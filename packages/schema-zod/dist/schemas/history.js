import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);
export const MessageHistoryStatus = z.enum(['sent', 'failed', 'pending']);
export const MessageHistory = z.object({
    id: z.string().uuid(),
    messageId: z.string().uuid(),
    status: MessageHistoryStatus,
    sentAt: z.string().datetime().nullable(),
    recipientCount: z.number().int().min(0),
    errorMessage: z.string().nullable(),
    createdAt: z.string().datetime()
});
export const MessageHistoryListResponse = z.object({
    ok: z.boolean(),
    data: z.array(MessageHistory)
});
export const MessageHistoryResponse = z.object({
    ok: z.boolean(),
    data: MessageHistory
});
