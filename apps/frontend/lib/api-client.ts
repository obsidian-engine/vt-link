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

export interface Fan {
  id: string
  displayName: string | null
  pictureUrl: string | null
  tags: string[]
  followedAt: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MessageHistory {
  id: string
  messageId: string
  recipientCount: number
  status: string
  sentAt: string | null
  errorMessage: string | null
  createdAt: string
}

export interface UserSettings {
  timezone: string
  language: string
  defaultReplyDelay: number
  notificationEnabled: boolean
}

export interface UpdateUserSettingsRequest {
  timezone?: string
  language?: string
  defaultReplyDelay?: number
  notificationEnabled?: boolean
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
  PATCH<T = unknown>(path: string, options?: { params?: { path?: Record<string, string> }; body?: unknown }): Promise<ApiResponse<T>>
}

export function makeClient(): ApiClient {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || ''
  let isRefreshing = false
  let refreshPromise: Promise<boolean> | null = null

  /**
   * CookieからCSRFトークンを取得
   */
  function getCsrfTokenFromCookie(): string {
    if (typeof document === 'undefined') return ''
    const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
    return match ? match[1] : ''
  }

  /**
   * トークンリフレッシュ（並列リクエストの競合制御付き）
   */
  async function refreshToken(): Promise<boolean> {
    if (isRefreshing && refreshPromise) {
      return refreshPromise
    }

    isRefreshing = true
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${apiBase}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'X-CSRF-Token': getCsrfTokenFromCookie(),
          },
        })
        return res.ok
      } catch (error) {
        console.error('Token refresh failed:', error)
        return false
      } finally {
        isRefreshing = false
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  /**
   * 認証付きリクエストラッパー（401時自動リトライ）
   */
  async function requestWithAuth<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const makeRequest = async (): Promise<Response> => {
      return fetch(`${apiBase}${path}`, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfTokenFromCookie(),
        },
        body: body ? JSON.stringify(body) : undefined,
      })
    }

    let response = await makeRequest()

    // 401エラー時はリフレッシュを試みる（1回のみ）
    if (response.status === 401) {
      const refreshed = await refreshToken()
      if (refreshed) {
        // リトライ
        response = await makeRequest()
        
        // リトライ後も401なら、ログインページへ
        if (response.status === 401) {
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
          return {
            error: {
              message: 'Session expired',
              status: 401,
            },
          }
        }
      } else {
        // リフレッシュ失敗 → ログインページへ
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return {
          error: {
            message: 'Session expired',
            status: 401,
          },
        }
      }
    }

    if (!response.ok) {
      return {
        error: {
          message: `Request failed: ${response.statusText}`,
          status: response.status,
        },
      }
    }

    try {
      const data = await response.json()
      return { data }
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      return {
        error: {
          message: 'Invalid JSON response',
          status: response.status,
        },
      }
    }
  }

  return {
    async GET<T = unknown>(
      path: string,
      options?: { params?: { path?: Record<string, string> } }
    ): Promise<ApiResponse<T>> {
      let finalPath = path
      if (options?.params?.path) {
        Object.entries(options.params.path).forEach(([key, value]) => {
          finalPath = finalPath.replace(`:${key}`, value)
        })
      }
      return requestWithAuth<T>('GET', finalPath)
    },

    async POST<T = unknown>(
      path: string,
      options?: { body?: unknown }
    ): Promise<ApiResponse<T>> {
      return requestWithAuth<T>('POST', path, options?.body)
    },

    async PUT<T = unknown>(
      path: string,
      options?: { params?: { path?: Record<string, string> }; body?: unknown }
    ): Promise<ApiResponse<T>> {
      let finalPath = path
      if (options?.params?.path) {
        Object.entries(options.params.path).forEach(([key, value]) => {
          finalPath = finalPath.replace(`:${key}`, value)
        })
      }
      return requestWithAuth<T>('PUT', finalPath, options?.body)
    },

    async DELETE<T = unknown>(
      path: string,
      options?: { params?: { path?: Record<string, string> } }
    ): Promise<ApiResponse<T>> {
      let finalPath = path
      if (options?.params?.path) {
        Object.entries(options.params.path).forEach(([key, value]) => {
          finalPath = finalPath.replace(`:${key}`, value)
        })
      }
      return requestWithAuth<T>('DELETE', finalPath)
    },

    async PATCH<T = unknown>(
      path: string,
      options?: { params?: { path?: Record<string, string> }; body?: unknown }
    ): Promise<ApiResponse<T>> {
      let finalPath = path
      if (options?.params?.path) {
        Object.entries(options.params.path).forEach(([key, value]) => {
          finalPath = finalPath.replace(`:${key}`, value)
        })
      }
      return requestWithAuth<T>('PATCH', finalPath, options?.body)
    },
  }
}

/**
 * APIクライアントのシングルトンインスタンス
 */
export const api = makeClient()
