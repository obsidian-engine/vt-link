'use client'
import useSWR from 'swr'
import { makeClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api-client'

const client = makeClient()

// 型定義（api-clientから自動生成される想定だが、一旦ローカル定義）
export interface Fan {
  id: string
  lineUserId: string
  displayName: string | null
  pictureUrl: string | null
  followedAt: string
  lastInteractionAt: string | null
  isBlocked: boolean
  tags: string[]
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UpdateFanTagsRequest {
  tags: string[]
}

// ファン一覧取得（ページネーション対応）
export function useFans(page: number = 1, limit: number = 20) {
  const { data, error, mutate } = useSWR<ApiResponse<{ data: Fan[]; pagination: Pagination }>>(
    ['/api/v1/audience/fans', 'listFans', page, limit],
    async () => {
      return client.GET<{ data: Fan[]; pagination: Pagination }>(`/api/v1/audience/fans?page=${page}&limit=${limit}`)
    }
  )

  return {
    fans: data?.data?.data ?? [],
    pagination: data?.data?.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 0 },
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

// ファン詳細取得
export function useFan(id: string) {
  const { data, error, mutate } = useSWR<ApiResponse<{ data: Fan }>>(
    id ? ['/api/v1/audience/fans', 'getFan', id] : null,
    async () => {
      return client.GET<{ data: Fan }>(`/api/v1/audience/fans/${id}`)
    }
  )

  return {
    fan: data?.data?.data ?? null,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

// タグ更新
export async function updateFanTags(id: string, input: UpdateFanTagsRequest): Promise<ApiResponse<Fan>> {
  const res = await client.PUT<Fan>(`/api/v1/audience/fans/${id}/tags`, {
    body: input
  })
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}

// ファンをブロック
export async function blockFan(id: string): Promise<ApiResponse<Fan>> {
  const res = await client.POST<Fan>(`/api/v1/audience/fans/${id}/block`, {})
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}

// ファンのブロック解除
export async function unblockFan(id: string): Promise<ApiResponse<Fan>> {
  const res = await client.POST<Fan>(`/api/v1/audience/fans/${id}/unblock`, {})
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}

// ファン削除
export async function deleteFan(id: string): Promise<ApiResponse<void>> {
  const res = await client.DELETE<void>(`/api/v1/audience/fans/${id}`)
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}


export interface AudienceStats {
  totalFans: number
  activeUsers: { count: number; percentage: number }
  monthlyNewFans: number
  todayNewRegistrations: number
}

export function useAudienceStats() {
  const { data, error, mutate } = useSWR<ApiResponse<{ data: AudienceStats }>>(
    ['/api/v1/audience/stats', 'getAudienceStats'],
    async () => {
      return client.GET<{ data: AudienceStats }>('/api/v1/audience/stats')
    }
  )

  return {
    stats: data?.data?.data ?? null,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}
