import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const AutoReplyRuleType = z.enum(['follow', 'keyword'])
  .openapi({
    description: 'ルール種別',
    example: 'follow'
  })

export const MatchType = z.enum(['exact', 'partial'])
  .openapi({
    description: 'キーワードマッチ条件',
    example: 'partial'
  })

export const AutoReplyRule = z.object({
  id: z.string().uuid()
    .openapi({
      description: 'ルールID',
      example: '550e8400-e29b-41d4-a716-446655440000'
    }),
  type: AutoReplyRuleType,
  name: z.string().min(1).max(50)
    .openapi({
      description: 'ルール名',
      example: 'フォロー時の自動返信'
    }),
  keywords: z.array(z.string()).max(10).optional()
    .openapi({
      description: 'キーワード配列（最大10個、keyword typeの場合のみ）',
      example: ['こんにちは', 'お問い合わせ']
    }),
  matchType: MatchType.optional()
    .openapi({
      description: 'マッチ条件（keyword typeの場合のみ）',
      example: 'partial'
    }),
  replyMessage: z.string().min(1).max(1000)
    .openapi({
      description: '返信メッセージ',
      example: 'フォローありがとうございます！今後ともよろしくお願いいたします。'
    }),
  isEnabled: z.boolean()
    .openapi({
      description: '有効フラグ',
      example: true
    }),
  priority: z.number().int().min(1).max(5)
    .openapi({
      description: '優先度（1-5）',
      example: 1
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
  description: '自動返信ルール',
  example: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    type: 'follow',
    name: 'フォロー時の自動返信',
    replyMessage: 'フォローありがとうございます！今後ともよろしくお願いいたします。',
    isEnabled: true,
    priority: 1,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-10T09:00:00Z'
  }
})

export const CreateAutoReplyRuleRequest = z.object({
  type: AutoReplyRuleType,
  name: z.string().min(1).max(50),
  keywords: z.array(z.string()).max(10).optional(),
  matchType: MatchType.optional(),
  replyMessage: z.string().min(1).max(1000),
  isEnabled: z.boolean().default(true),
  priority: z.number().int().min(1).max(5).default(1)
}).openapi({
  description: '自動返信ルール作成リクエスト'
})

export const UpdateAutoReplyRuleRequest = CreateAutoReplyRuleRequest.partial()
  .openapi({
    description: '自動返信ルール更新リクエスト'
  })

export const AutoReplyRuleListResponse = z.object({
  ok: z.boolean(),
  data: z.array(AutoReplyRule)
}).openapi({
  description: '自動返信ルール一覧レスポンス'
})

export const AutoReplyRuleResponse = z.object({
  ok: z.boolean(),
  data: AutoReplyRule
}).openapi({
  description: '自動返信ルールレスポンス'
})

export const BulkUpdateAutoReplyRulesRequest = z.object({
  updates: z.array(z.object({
    id: z.string().uuid(),
    isEnabled: z.boolean()
  })).min(1).max(5)
}).openapi({
  description: '自動返信ルール一括更新リクエスト'
})

export const BulkUpdateAutoReplyRulesResponse = z.object({
  ok: z.boolean(),
  data: z.object({
    message: z.string(),
    count: z.number().int()
  })
}).openapi({
  description: '自動返信ルール一括更新レスポンス'
})

export type AutoReplyRule = z.infer<typeof AutoReplyRule>
export type AutoReplyRuleType = z.infer<typeof AutoReplyRuleType>
export type MatchType = z.infer<typeof MatchType>
export type CreateAutoReplyRuleRequest = z.infer<typeof CreateAutoReplyRuleRequest>
export type UpdateAutoReplyRuleRequest = z.infer<typeof UpdateAutoReplyRuleRequest>
export type AutoReplyRuleListResponse = z.infer<typeof AutoReplyRuleListResponse>
export type AutoReplyRuleResponse = z.infer<typeof AutoReplyRuleResponse>
export type BulkUpdateAutoReplyRulesRequest = z.infer<typeof BulkUpdateAutoReplyRulesRequest>
export type BulkUpdateAutoReplyRulesResponse = z.infer<typeof BulkUpdateAutoReplyRulesResponse>
