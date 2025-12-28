'use client'
import useSWR from 'swr'
import { makeClient } from '@/lib/api-client'
import type { ApiResponse } from '@/lib/api-client'

const client = makeClient()

export interface Segment {
  id: string
  name: string
  description: string
  count: number
}

export function useSegments() {
  const { data, error, mutate } = useSWR<ApiResponse<{ data: Segment[] }>>(
    ['/api/v1/audience/segments', 'getSegments'],
    async () => {
      return client.GET<{ data: Segment[] }>('/api/v1/audience/segments')
    }
  )

  return {
    segments: data?.data?.data ?? [],
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}
