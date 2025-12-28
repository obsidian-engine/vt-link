'use client'
import useSWR from 'swr'
import { makeClient } from '../api-client'
import type { ApiResponse } from '../api-client'

const client = makeClient()

export interface DashboardStats {
  friendCount: number
  sendCount: number
  sendLimit: number
  averageCtr: number
  monthlyRevenue: number
}

export interface Campaign {
  id: string
  name: string
  sentCount: number
  ctr: number
  cvr: number
  status: 'active' | 'ended' | 'paused'
  createdAt: string
}

// ダッシュボード統計取得
export function useDashboardStats() {
  const { data, error, mutate } = useSWR<ApiResponse<{ data: DashboardStats }>>(
    ['/api/v1/dashboard/stats', 'getDashboardStats'],
    async () => {
      return client.GET<{ data: DashboardStats }>('/api/v1/dashboard/stats')
    }
  )

  return {
    stats: data?.data?.data ?? null,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

// キャンペーン一覧取得
export function useCampaigns() {
  const { data, error, mutate } = useSWR<ApiResponse<{ data: Campaign[] }>>(
    ['/api/v1/campaigns', 'getCampaigns'],
    async () => {
      return client.GET<{ data: Campaign[] }>('/api/v1/campaigns')
    }
  )

  return {
    campaigns: data?.data?.data ?? [],
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}
