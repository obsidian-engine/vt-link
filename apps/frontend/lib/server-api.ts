import { cookies } from 'next/headers'
import type { ApiResponse } from './api-client'

/**
 * Server Components専用APIクライアント
 *
 * 特徴:
 * - cookies()を使用してサーバーサイドでCookie読み取り
 * - fetch()のキャッシュ戦略設定（revalidate等）
 * - Client Components用のapi-client.tsと型定義を共有
 */

interface RequestOptions {
  /** パスパラメータ（:id などを置換） */
  params?: {
    path?: Record<string, string>
  }
  /** リクエストボディ */
  body?: unknown
  /** Next.js キャッシュ再検証時間（秒）。0で常に最新データ取得 */
  revalidate?: number
  /** Next.jsキャッシュタグ（revalidateTag用） */
  tags?: string[]
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

/**
 * CookieストアからCSRFトークンを取得
 */
async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  const csrfCookie = cookieStore.get('csrf_token')
  return csrfCookie?.value || ''
}

/**
 * Cookieストアからセッションクッキーを取得してCookie文字列を構築
 */
async function buildCookieHeader(): Promise<string> {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  return allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
}

/**
 * パスパラメータを置換
 */
function replacePath(path: string, params?: Record<string, string>): string {
  if (!params) return path

  let result = path
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value)
  })
  return result
}

/**
 * Server Components用APIリクエスト共通処理
 */
async function serverRequest<T>(
  method: string,
  path: string,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  const finalPath = replacePath(path, options?.params?.path)
  const url = `${apiBase}${finalPath}`

  try {
    const csrfToken = await getCsrfToken()
    const cookieHeader = await buildCookieHeader()

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // CSRFトークンがある場合は付与
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }

    // Cookieヘッダーを付与（セッションCookie等を送信）
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader
    }

    const response = await fetch(url, {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      // Next.jsキャッシュ設定
      next: {
        revalidate: options?.revalidate,
        tags: options?.tags,
      },
    })

    if (!response.ok) {
      return {
        error: {
          message: `Request failed: ${response.statusText}`,
          status: response.status,
        },
      }
    }

    // レスポンスボディが空の場合も考慮
    const text = await response.text()
    if (!text) {
      return { data: undefined as T }
    }

    try {
      const data = JSON.parse(text) as T
      return { data }
    } catch {
      return {
        error: {
          message: 'Invalid JSON response',
          status: response.status,
        },
      }
    }
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      },
    }
  }
}

/**
 * Server Components用APIクライアント
 */
export const serverApi = {
  /**
   * GETリクエスト
   * @param path APIパス（例: '/messages' or '/messages/:id'）
   * @param options リクエストオプション（パスパラメータ、キャッシュ設定等）
   */
  async GET<T = unknown>(
    path: string,
    options?: Omit<RequestOptions, 'body'>
  ): Promise<ApiResponse<T>> {
    return serverRequest<T>('GET', path, options)
  },

  /**
   * POSTリクエスト
   * @param path APIパス
   * @param options リクエストオプション（ボディ、キャッシュ設定等）
   */
  async POST<T = unknown>(
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return serverRequest<T>('POST', path, options)
  },

  /**
   * PUTリクエスト
   * @param path APIパス（例: '/messages/:id'）
   * @param options リクエストオプション（パスパラメータ、ボディ、キャッシュ設定等）
   */
  async PUT<T = unknown>(
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return serverRequest<T>('PUT', path, options)
  },

  /**
   * DELETEリクエスト
   * @param path APIパス（例: '/messages/:id'）
   * @param options リクエストオプション（パスパラメータ、キャッシュ設定等）
   */
  async DELETE<T = unknown>(
    path: string,
    options?: Omit<RequestOptions, 'body'>
  ): Promise<ApiResponse<T>> {
    return serverRequest<T>('DELETE', path, options)
  },

  /**
   * PATCHリクエスト
   * @param path APIパス（例: '/messages/:id'）
   * @param options リクエストオプション（パスパラメータ、ボディ、キャッシュ設定等）
   */
  async PATCH<T = unknown>(
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return serverRequest<T>('PATCH', path, options)
  },
}

/**
 * キャッシュ戦略のプリセット
 *
 * 使用例:
 * ```ts
 * // 60秒間キャッシュ
 * await serverApi.GET('/messages', { revalidate: CACHE_STRATEGY.SHORT })
 *
 * // 常に最新データ取得
 * await serverApi.GET('/messages', { revalidate: CACHE_STRATEGY.NO_CACHE })
 * ```
 */
export const CACHE_STRATEGY = {
  /** キャッシュしない（常に最新データ取得） */
  NO_CACHE: 0,
  /** 短時間キャッシュ（60秒） */
  SHORT: 60,
  /** 中程度キャッシュ（5分） */
  MEDIUM: 300,
  /** 長時間キャッシュ（1時間） */
  LONG: 3600,
} as const
