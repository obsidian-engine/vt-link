export * from './message.js'
export * from './fan.js'
export * from './auth.js'
export * from './autoreply.js'

// 共通レスポンス型
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const ApiError = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional()
  })
}).openapi({
  description: 'APIエラーレスポンス'
})

export const ApiSuccess = z.object({
  ok: z.literal(true),
  message: z.string().optional()
}).openapi({
  description: 'API成功レスポンス'
})

export type ApiError = z.infer<typeof ApiError>
export type ApiSuccess = z.infer<typeof ApiSuccess>