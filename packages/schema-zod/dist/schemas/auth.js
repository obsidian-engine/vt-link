import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);
// User スキーマ
export const User = z.object({
    id: z.string().uuid()
        .openapi({
        description: 'ユーザーID',
        example: '550e8400-e29b-41d4-a716-446655440000'
    }),
    displayName: z.string().min(1).max(100)
        .openapi({
        description: 'ユーザー表示名',
        example: '山田太郎'
    }),
    pictureUrl: z.string().url().nullable()
        .openapi({
        description: 'プロフィール画像URL',
        example: 'https://example.com/profile.jpg'
    }),
    email: z.string().email().nullable()
        .openapi({
        description: 'メールアドレス',
        example: 'user@example.com'
    })
}).openapi({
    description: 'ユーザー情報',
    example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        displayName: '山田太郎',
        pictureUrl: 'https://example.com/profile.jpg',
        email: 'user@example.com'
    }
});
// LoginRequest スキーマ
export const LoginRequest = z.object({
    code: z.string().min(1)
        .openapi({
        description: 'LINE認証コード',
        example: 'abc123xyz'
    }),
    state: z.string().min(1).optional()
        .openapi({
        description: 'CSRF対策用state',
        example: 'random-state-value'
    })
}).openapi({
    description: 'LINEログインリクエスト',
    example: {
        code: 'abc123xyz',
        state: 'random-state-value'
    }
});
// LoginResponse スキーマ
export const LoginResponse = z.object({
    ok: z.literal(true),
    data: z.object({
        accessToken: z.string()
            .openapi({
            description: 'アクセストークン',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }),
        refreshToken: z.string()
            .openapi({
            description: 'リフレッシュトークン',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }),
        user: User
    })
}).openapi({
    description: 'LINEログインレスポンス',
    example: {
        ok: true,
        data: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                displayName: '山田太郎',
                pictureUrl: 'https://example.com/profile.jpg',
                email: 'user@example.com'
            }
        }
    }
});
// RefreshTokenRequest スキーマ
export const RefreshTokenRequest = z.object({
    refreshToken: z.string().min(1)
        .openapi({
        description: 'リフレッシュトークン',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
}).openapi({
    description: 'トークンリフレッシュリクエスト',
    example: {
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
});
// RefreshTokenResponse スキーマ
export const RefreshTokenResponse = z.object({
    ok: z.literal(true),
    data: z.object({
        accessToken: z.string()
            .openapi({
            description: '新しいアクセストークン',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }),
        refreshToken: z.string()
            .openapi({
            description: '新しいリフレッシュトークン',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        })
    })
}).openapi({
    description: 'トークンリフレッシュレスポンス',
    example: {
        ok: true,
        data: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
    }
});
