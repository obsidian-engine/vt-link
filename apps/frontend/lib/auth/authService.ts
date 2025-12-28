/**
 * 認証サービス - Cookie操作の抽象化
 *
 * テスト可能な設計:
 * - StorageAdapter インターフェースでストレージを抽象化
 * - createAuthService でDI可能なファクトリ関数を提供
 * - デフォルトはCookieを使用（バックエンドと統一）
 */

// ストレージ抽象化インターフェース
export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

// トークン型定義
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// 認証サービスインターフェース
export interface AuthService {
  getAccessToken(): string | null
  getRefreshToken(): string | null
  setTokens(tokens: AuthTokens): void
  clearTokens(): void
  isAuthenticated(): boolean
}

// Cookieキー定数（バックエンドと一致させる）
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const

// Cookie操作ヘルパー
const createCookieAdapter = (): StorageAdapter => ({
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${key}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return
    // HttpOnly Cookieはサーバー側で設定されるため、クライアントでは設定しない
    // この関数は互換性のために残すが、実際の設定はバックエンドが行う
    console.warn('Cookie設定はバックエンドで行われます')
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return
    document.cookie = `${key}=; Max-Age=0; path=/`
  },
})

/**
 * 認証サービスファクトリ
 * @param storage - ストレージアダプター（デフォルト: Cookie）
 */
export function createAuthService(
  storage: StorageAdapter = createCookieAdapter()
): AuthService {
  return {
    getAccessToken(): string | null {
      return storage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    },

    getRefreshToken(): string | null {
      return storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    },

    setTokens(tokens: AuthTokens): void {
      storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken)
      storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
    },

    clearTokens(): void {
      storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    },

    isAuthenticated(): boolean {
      return this.getAccessToken() !== null
    },
  }
}

// デフォルトのauthServiceインスタンス
export const authService = createAuthService()

// LINE OAuth関連
const LINE_CLIENT_ID = process.env.NEXT_PUBLIC_LINE_CLIENT_ID ?? ''
const REDIRECT_URI = process.env.NEXT_PUBLIC_LINE_REDIRECT_URI ?? ''

/**
 * LINE OAuth認証URLを生成
 */
export function getLineLoginUrl(): string {
  const state = crypto.randomUUID()
  return `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=profile%20openid%20email`
}

/**
 * LINE認証ページにリダイレクト
 */
export function redirectToLineLogin(): void {
  if (typeof window === 'undefined') return
  window.location.href = getLineLoginUrl()
}

/**
 * CookieからCSRFトークンを取得
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}
