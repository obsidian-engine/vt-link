import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);
export const RichMenuTemplate = z.enum(['2x3', '1x3', '2x2'])
    .openapi({
    description: 'リッチメニューテンプレート',
    example: '2x3'
});
export const RichMenuActionType = z.enum(['uri', 'message'])
    .openapi({
    description: 'リッチメニューアクション種別',
    example: 'uri'
});
export const RichMenuBounds = z.object({
    x: z.number().int().min(0)
        .openapi({
        description: 'X座標',
        example: 0
    }),
    y: z.number().int().min(0)
        .openapi({
        description: 'Y座標',
        example: 0
    }),
    width: z.number().int().min(1)
        .openapi({
        description: '幅',
        example: 833
    }),
    height: z.number().int().min(1)
        .openapi({
        description: '高さ',
        example: 843
    })
}).openapi({
    description: 'リッチメニューエリアの境界',
    example: {
        x: 0,
        y: 0,
        width: 833,
        height: 843
    }
});
export const RichMenuAction = z.object({
    type: RichMenuActionType,
    uri: z.string().url().optional()
        .openapi({
        description: 'URLリンク（type=uriの場合）',
        example: 'https://example.com'
    }),
    label: z.string().max(20).optional()
        .openapi({
        description: 'ボタンラベル',
        example: '商品一覧'
    }),
    text: z.string().max(300).optional()
        .openapi({
        description: 'テキスト送信内容（type=messageの場合）',
        example: '商品を見る'
    })
}).openapi({
    description: 'リッチメニューアクション',
    example: {
        type: 'uri',
        uri: 'https://example.com',
        label: '商品一覧'
    }
});
export const RichMenuArea = z.object({
    bounds: RichMenuBounds,
    action: RichMenuAction
}).openapi({
    description: 'リッチメニューエリア',
    example: {
        bounds: {
            x: 0,
            y: 0,
            width: 833,
            height: 843
        },
        action: {
            type: 'uri',
            uri: 'https://example.com',
            label: '商品一覧'
        }
    }
});
export const RichMenu = z.object({
    id: z.string().uuid()
        .openapi({
        description: 'リッチメニューID',
        example: '550e8400-e29b-41d4-a716-446655440000'
    }),
    name: z.string().min(1).max(50)
        .openapi({
        description: 'リッチメニュー名',
        example: 'メインメニュー'
    }),
    template: RichMenuTemplate,
    imageUrl: z.string().url()
        .openapi({
        description: '画像URL（Vercel Blob）',
        example: 'https://blob.vercel-storage.com/richmenu-abc123.png'
    }),
    areas: z.array(RichMenuArea).max(6)
        .openapi({
        description: 'エリア配列（最大6個）',
        example: [
            {
                bounds: { x: 0, y: 0, width: 833, height: 843 },
                action: { type: 'uri', uri: 'https://example.com', label: '商品一覧' }
            }
        ]
    }),
    lineRichMenuId: z.string().max(255).nullable()
        .openapi({
        description: 'LINE Rich Menu ID',
        example: 'richmenu-abc123def456'
    }),
    isActive: z.boolean()
        .openapi({
        description: '有効フラグ',
        example: true
    }),
    createdAt: z.string().datetime()
        .openapi({
        description: '作成日時 (ISO 8601)',
        example: '2025-01-10T09:00:00Z'
    }),
    updatedAt: z.string().datetime()
        .openapi({
        description: '更新日時 (ISO 8601)',
        example: '2025-01-10T09:00:00Z'
    })
}).openapi({
    description: 'リッチメニュー',
    example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'メインメニュー',
        template: '2x3',
        imageUrl: 'https://blob.vercel-storage.com/richmenu-abc123.png',
        areas: [
            {
                bounds: { x: 0, y: 0, width: 833, height: 843 },
                action: { type: 'uri', uri: 'https://example.com', label: '商品一覧' }
            }
        ],
        lineRichMenuId: 'richmenu-abc123def456',
        isActive: true,
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-10T09:00:00Z'
    }
});
export const CreateRichMenuRequest = z.object({
    name: z.string().min(1).max(50),
    template: RichMenuTemplate,
    imageUrl: z.string().url(),
    areas: z.array(RichMenuArea).max(6),
    isActive: z.boolean().default(false)
}).openapi({
    description: 'リッチメニュー作成リクエスト'
});
export const UpdateRichMenuRequest = CreateRichMenuRequest.partial()
    .openapi({
    description: 'リッチメニュー更新リクエスト'
});
export const RichMenuListResponse = z.object({
    ok: z.boolean(),
    data: z.array(RichMenu)
}).openapi({
    description: 'リッチメニュー一覧レスポンス'
});
export const RichMenuResponse = z.object({
    ok: z.boolean(),
    data: RichMenu
}).openapi({
    description: 'リッチメニューレスポンス'
});
