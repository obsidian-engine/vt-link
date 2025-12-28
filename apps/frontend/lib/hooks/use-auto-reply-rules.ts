'use client'
import useSWR from 'swr'
import { makeClient } from '../api-client'
import type {
  AutoReplyRule,
  CreateAutoReplyRuleRequest,
  UpdateAutoReplyRuleRequest,
  ApiResponse
} from '../api-client'

const client = makeClient()

// ルール一覧取得
export function useAutoReplyRules() {
  const { data, error, mutate } = useSWR<ApiResponse<{ data: AutoReplyRule[] }>>(
    ['/api/v1/autoreply/rules', 'listRules'],
    async () => {
      return client.GET<{ data: AutoReplyRule[] }>('/api/v1/autoreply/rules')
    }
  )

  return {
    rules: data?.data?.data ?? [],
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

// ルール作成
export async function createRule(input: CreateAutoReplyRuleRequest): Promise<ApiResponse<AutoReplyRule>> {
  const res = await client.POST<AutoReplyRule>('/api/v1/autoreply/rules', { body: input })
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}

// ルール更新
export async function updateRule(
  id: string,
  input: UpdateAutoReplyRuleRequest
): Promise<ApiResponse<AutoReplyRule>> {
  const res = await client.PUT<AutoReplyRule>('/api/v1/autoreply/rules/{id}', {
    params: { path: { id } },
    body: input
  })
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}

// ルール削除
export async function deleteRule(id: string): Promise<ApiResponse<void>> {
  const res = await client.DELETE<void>('/api/v1/autoreply/rules/{id}', {
    params: { path: { id } }
  })
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}

// 一括更新（有効/無効の切り替え）
export async function bulkUpdateRules(
  updates: { id: string; isEnabled: boolean }[]
): Promise<ApiResponse<{ message: string; count: number }>> {
  const res = await client.PATCH<{ message: string; count: number }>(
    '/api/v1/autoreply/rules/bulk',
    { body: { updates } }
  )
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}
