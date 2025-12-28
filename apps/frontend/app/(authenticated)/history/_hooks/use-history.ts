'use client'
import useSWR from 'swr'
import { makeClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api-client'

const client = makeClient()

// 型定義（api-clientから自動生成される想定だが、一旦ローカル定義）
export type MessageHistoryStatus = 'sent' | 'failed' | 'pending'

export interface MessageHistory {
  id: string
  messageId: string
  status: MessageHistoryStatus
  sentAt: string | null
  recipientCount: number
  errorMessage: string | null
  createdAt: string
}

// 配信履歴一覧取得
export function useHistory(limit?: number, offset?: number) {
  const params = new URLSearchParams()
  if (limit !== undefined) params.append('limit', String(limit))
  if (offset !== undefined) params.append('offset', String(offset))

  const queryString = params.toString()
  const url = queryString ? `/api/v1/history?${queryString}` : '/api/v1/history'

  const { data, error, mutate} = useSWR<ApiResponse<{ data: MessageHistory[] }>>(
    [url, 'listHistory'],
    async () => {
      return client.GET<{ data: MessageHistory[] }>(url)
    }
  )

  return {
    histories: data?.data?.data ?? [],
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

// 個別履歴取得
export function useHistoryDetail(id?: string) {
  const { data, error, mutate } = useSWR<ApiResponse<{ data: MessageHistory }>>(
    id ? [`/api/v1/history/${id}`, 'getHistory'] : null,
    id ? async () => client.GET<{ data: MessageHistory }>(`/api/v1/history/${id}`) : null
  )

  return {
    history: data?.data?.data ?? null,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}


export interface HistoryStats {
  totalDeliveries: number
  totalReach: number
  averageCTR: number
  monthlyDeliveries: { current: number; previousMonth: number }
}

export function useHistoryStats() {
  const { data, error, mutate } = useSWR<ApiResponse<{ data: HistoryStats }>>(
    ['/api/v1/history/stats', 'getHistoryStats'],
    async () => {
      return client.GET<{ data: HistoryStats }>('/api/v1/history/stats')
    }
  )

  return {
    stats: data?.data?.data ?? null,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}
