'use client'
import useSWR from 'swr'
import { makeClient } from '../api-client'
import type {
  RichMenu,
  CreateRichMenuRequest,
  UpdateRichMenuRequest,
  ApiResponse
} from '../api-client'

const client = makeClient()

// リッチメニュー取得
export function useRichMenu() {
  const { data, error, mutate } = useSWR<ApiResponse<RichMenu>>(
    ['/api/v1/richmenu', 'getRichMenu'],
    async () => {
      return client.GET<RichMenu>('/api/v1/richmenu')
    }
  )

  return {
    richMenu: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

// リッチメニュー作成
export async function createRichMenu(input: CreateRichMenuRequest): Promise<ApiResponse<RichMenu>> {
  const res = await client.POST<RichMenu>('/api/v1/richmenu', { body: input })
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}

// リッチメニュー更新
export async function updateRichMenu(
  id: string,
  input: UpdateRichMenuRequest
): Promise<ApiResponse<RichMenu>> {
  const res = await client.PUT<RichMenu>('/api/v1/richmenu/{id}', {
    params: { path: { id } },
    body: input
  })
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}

// リッチメニュー削除
export async function deleteRichMenu(id: string): Promise<ApiResponse<void>> {
  const res = await client.DELETE<void>('/api/v1/richmenu/{id}', {
    params: { path: { id } }
  })
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}

// リッチメニュー公開
export async function publishRichMenu(id: string): Promise<ApiResponse<RichMenu>> {
  const res = await client.POST<RichMenu>(`/api/v1/richmenu/${id}/publish`)
  if (res.error) {
    throw new Error(res.error.message)
  }
  return res
}
