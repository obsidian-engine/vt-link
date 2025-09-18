import createClient from 'openapi-fetch'
import type { paths } from './__generated__/types.js'

const BASE_URL = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
  : process.env.API_BASE || 'http://localhost:8080'

export function makeClient(baseUrl?: string) {
  return createClient<paths>({
    baseUrl: baseUrl || BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export type ApiClient = ReturnType<typeof makeClient>
export type { paths } from './__generated__/types.js'