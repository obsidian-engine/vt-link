import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const MessageStatus = z.enum(['draft', 'scheduled', 'sent', 'failed'])
  .openapi({
    description: 'メッセージ配信のステータス',
    example: 'draft'
  })

export const Message = z.object({
  id: z.string().uuid()
    .openapi({
      description: 'メッセージID',
      example: '550e8400-e29b-41d4-a716-446655440000'
    }),
  title: z.string().min(1).max(100)
    .openapi({
      description: 'メッセージタイトル',
      example: '新商品リリース記念'
    }),
  body: z.string().min(1).max(1000)
    .openapi({
      description: 'メッセージ本文',
      example: '新商品のリリースを記念して、先着100名様に限定グッズをプレゼント！'
    }),
  imageUrl: z.string().url().nullable()
    .openapi({
      description: '画像URL',
      example: 'https://example.com/image.jpg'
    }),
  scheduledAt: z.string().datetime().nullable()
    .openapi({
      description: '配信予定日時 (ISO 8601)',
      example: '2025-01-15T10:00:00Z'
    }),
  sentAt: z.string().datetime().nullable()
    .openapi({
      description: '配信日時 (ISO 8601)',
      example: '2025-01-15T10:00:00Z'
    }),
  status: MessageStatus,
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
  description: 'メッセージ配信情報',
  example: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: '新商品リリース記念',
    body: '新商品のリリースを記念して、先着100名様に限定グッズをプレゼント！',
    imageUrl: 'https://example.com/image.jpg',
    scheduledAt: '2025-01-15T10:00:00Z',
    sentAt: null,
    status: 'scheduled',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-10T09:00:00Z'
  }
})

export const CreateMessageRequest = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(1000),
  imageUrl: z.string().url().optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled']).default('draft')
}).openapi({
  description: 'メッセージ作成リクエスト'
})

export const UpdateMessageRequest = CreateMessageRequest.partial()
  .openapi({
    description: 'メッセージ更新リクエスト'
  })

export const MessageListResponse = z.object({
  ok: z.boolean(),
  data: z.array(Message)
}).openapi({
  description: 'メッセージ一覧レスポンス'
})

export const MessageResponse = z.object({
  ok: z.boolean(),
  data: Message
}).openapi({
  description: 'メッセージレスポンス'
})

export type Message = z.infer<typeof Message>
export type MessageStatus = z.infer<typeof MessageStatus>
export type CreateMessageRequest = z.infer<typeof CreateMessageRequest>
export type UpdateMessageRequest = z.infer<typeof UpdateMessageRequest>
export type MessageListResponse = z.infer<typeof MessageListResponse>
export type MessageResponse = z.infer<typeof MessageResponse>
