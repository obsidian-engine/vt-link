import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);
export const Fan = z.object({
    id: z.string().uuid()
        .openapi({
        description: 'ファンID',
        example: '660e8400-e29b-41d4-a716-446655440000'
    }),
    lineUserId: z.string()
        .openapi({
        description: 'LINE ユーザーID',
        example: 'U1234567890abcdef1234567890abcdef'
    }),
    displayName: z.string().nullable()
        .openapi({
        description: '表示名',
        example: 'ファン太郎'
    }),
    pictureUrl: z.string().url().nullable()
        .openapi({
        description: 'プロフィール画像URL',
        example: 'https://profile.line-scdn.net/...'
    }),
    followedAt: z.string().datetime()
        .openapi({
        description: 'フォロー日時 (ISO 8601)',
        example: '2025-01-01T00:00:00Z'
    }),
    lastInteractionAt: z.string().datetime().nullable()
        .openapi({
        description: '最終インタラクション日時 (ISO 8601)',
        example: '2025-01-10T15:30:00Z'
    }),
    isBlocked: z.boolean().default(false)
        .openapi({
        description: 'ブロック状態',
        example: false
    }),
    tags: z.array(z.string())
        .openapi({
        description: 'ファンタグ',
        example: ['VIP', 'アクティブ']
    })
}).openapi({
    description: 'ファン情報'
});
export const FanListResponse = z.object({
    ok: z.boolean(),
    data: z.array(Fan),
    pagination: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number()
    })
}).openapi({
    description: 'ファン一覧レスポンス'
});
export const FanResponse = z.object({
    ok: z.boolean(),
    data: Fan
}).openapi({
    description: 'ファンレスポンス'
});
