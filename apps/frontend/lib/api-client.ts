import { makeClient as createClient } from '@vt-link/api-client'
import { getAccessToken } from './auth'

export interface Message {
  id: string
  title: string
  body: string
  imageUrl?: string | null
  scheduledAt?: string | null
  status: 'draft' | 'scheduled' | 'sent'
  createdAt: string
  updatedAt: string
}

export interface AutoReplyRule {
  id: string
  type: 'follow' | 'keyword'
  name: string
  keywords?: string[]
  matchType?: 'exact' | 'partial'
  replyMessage: string
  priority: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAutoReplyRuleRequest {
  type: 'follow' | 'keyword'
  name: string
  keywords?: string[]
  matchType?: 'exact' | 'partial'
  replyMessage: string
  priority: number
  isEnabled?: boolean
}

export interface UpdateAutoReplyRuleRequest {
  type?: 'follow' | 'keyword'
  name?: string
  keywords?: string[]
  matchType?: 'exact' | 'partial'
  replyMessage?: string
  priority?: number
  isEnabled?: boolean
}

export interface RichMenu {
  id: string
  name: string
  template: '2x3' | '1x3' | '2x2'
  imageUrl: string
  areas: RichMenuArea[]
  lineRichMenuId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RichMenuArea {
  bounds: { x: number; y: number; width: number; height: number }
  action: {
    type: 'uri' | 'message'
    uri?: string
    label?: string
    text?: string
  }
}

export interface CreateRichMenuRequest {
  name: string
  template: '2x3' | '1x3' | '2x2'
  imageUrl: string
  areas: RichMenuArea[]
}

export interface UpdateRichMenuRequest {
  name?: string
  imageUrl?: string
  areas?: RichMenuArea[]
}

export interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    status: number
  }
}

export interface ApiClient {
  GET<T = unknown>(path: string, options?: { params?: { path?: Record<string, string> } }): Promise<ApiResponse<T>>
  POST<T = unknown>(path: string, options?: { body?: unknown }): Promise<ApiResponse<T>>
  PUT<T = unknown>(path: string, options?: { params?: { path?: Record<string, string> }; body?: unknown }): Promise<ApiResponse<T>>
  DELETE<T = unknown>(path: string, options?: { params?: { path?: Record<string, string> } }): Promise<ApiResponse<T>>
}

export function makeClient(): ApiClient {
  const accessToken = getAccessToken()
  return createClient({ accessToken: accessToken || undefined }) as unknown as ApiClient
}
