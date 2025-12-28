'use client'
import useSWR from 'swr'
import { makeClient } from '../api-client'
import type { ApiResponse } from '../api-client'

const client = makeClient()

// 型定義（api-clientから自動生成される想定だが、一旦ローカル定義）
export interface UserSettings {
  id: string
  userId: string
  defaultReplyDelay: number
  notificationEnabled: boolean
  timezone: string
  language: string
  createdAt: string
  updatedAt: string
}

export interface UpdateUserSettingsRequest {
  defaultReplyDelay?: number
  notificationEnabled?: boolean
  timezone?: string
  language?: string
}

// 設定取得
export function useSettings() {
  const { data, error, mutate } = useSWR<ApiResponse<{ data: UserSettings }>>(
    ['/api/v1/settings', 'getSettings'],
    async () => {
      return client.GET<{ data: UserSettings }>('/api/v1/settings')
    }
  )

  return {
    settings: data?.data?.data ?? null,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

// 設定更新
export async function updateSettings(input: UpdateUserSettingsRequest): Promise<ApiResponse<UserSettings>> {
  const res = await client.PUT<UserSettings>('/api/v1/settings', { body: input })
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}
