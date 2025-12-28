import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const UserSettings = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  defaultReplyDelay: z.number().int().min(0).max(3600).default(0),
  notificationEnabled: z.boolean().default(true),
  timezone: z.string().default('Asia/Tokyo'),
  language: z.string().default('ja'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const UserSettingsResponse = z.object({
  ok: z.boolean(),
  data: UserSettings
})

export const UpdateUserSettingsRequest = UserSettings.pick({
  defaultReplyDelay: true,
  notificationEnabled: true,
  timezone: true,
  language: true
}).partial()

export type UserSettings = z.infer<typeof UserSettings>
export type UserSettingsResponse = z.infer<typeof UserSettingsResponse>
export type UpdateUserSettingsRequest = z.infer<typeof UpdateUserSettingsRequest>
