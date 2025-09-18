import useSWR from 'swr'
import { makeClient } from '../client.js'
import type { Fan } from '@vt-link/schema-zod'

const client = makeClient()

export function useFans(page = 1, limit = 20) {
  return useSWR(
    ['/api/v1/fans', 'listFans', page, limit],
    async () => {
      const res = await client.GET('/api/v1/fans', {
        params: {
          query: { page, limit }
        }
      })
      if (res.error) throw res.error
      return res.data
    }
  )
}

export function useFan(id: string) {
  return useSWR(
    id ? ['/api/v1/fans/{id}', 'getFan', id] : null,
    async () => {
      const res = await client.GET('/api/v1/fans/{id}', {
        params: { path: { id } }
      })
      if (res.error) throw res.error
      return res.data
    }
  )
}