import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const CampaignStatus = z.enum(['draft', 'scheduled', 'sent', 'failed'])
  .openapi({
    description: 'キャンペーンのステータス',
    example: 'draft'
  })

export const Campaign = z.object({
  id: z.string().uuid()
    .openapi({
      description: 'キャンペーンID',
      example: '550e8400-e29b-41d4-a716-446655440000'
    }),
  title: z.string().min(1).max(100)
    .openapi({
      description: 'キャンペーンタイトル',
      example: '新商品リリース記念キャンペーン'
    }),
  body: z.string().min(1).max(1000)
    .openapi({
      description: 'キャンペーン本文',
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
  status: CampaignStatus,
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
  description: 'キャンペーン情報',
  example: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: '新商品リリース記念キャンペーン',
    body: '新商品のリリースを記念して、先着100名様に限定グッズをプレゼント！',
    imageUrl: 'https://example.com/image.jpg',
    scheduledAt: '2025-01-15T10:00:00Z',
    sentAt: null,
    status: 'scheduled',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-10T09:00:00Z'
  }
})

export const CreateCampaignRequest = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(1000),
  imageUrl: z.string().url().optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled']).default('draft')
}).openapi({
  description: 'キャンペーン作成リクエスト'
})

export const UpdateCampaignRequest = CreateCampaignRequest.partial()
  .openapi({
    description: 'キャンペーン更新リクエスト'
  })

export const CampaignListResponse = z.object({
  ok: z.boolean(),
  data: z.array(Campaign)
}).openapi({
  description: 'キャンペーン一覧レスポンス'
})

export const CampaignResponse = z.object({
  ok: z.boolean(),
  data: Campaign
}).openapi({
  description: 'キャンペーンレスポンス'
})

export type Campaign = z.infer<typeof Campaign>
export type CampaignStatus = z.infer<typeof CampaignStatus>
export type CreateCampaignRequest = z.infer<typeof CreateCampaignRequest>
export type UpdateCampaignRequest = z.infer<typeof UpdateCampaignRequest>
export type CampaignListResponse = z.infer<typeof CampaignListResponse>
export type CampaignResponse = z.infer<typeof CampaignResponse>