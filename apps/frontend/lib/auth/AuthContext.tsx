'use client'

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  authService as defaultAuthService,
  redirectToLineLogin as defaultRedirectToLineLogin,
  type AuthService,
  type AuthTokens,
} from './authService'

// 認証状態の型定義
export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
}

// Contextの値の型定義
export interface AuthContextValue extends AuthState {
  login: () => void
  logout: () => void
  setTokens: (tokens: AuthTokens) => void
}

// Context作成（undefinedで初期化してProvider外での使用を検出）
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)

// Provider Props
interface AuthProviderProps {
  children: ReactNode
  // テスト用DI
  authService?: AuthService
  redirectToLineLogin?: () => void
}

/**
 * 認証プロバイダー
 *
 * 責務:
 * - 認証状態の管理（isAuthenticated, isLoading）
 * - トークンの保存・削除
 * - ログイン・ログアウト処理
 *
 * 設計原則:
 * - カスタムイベントを使わず、React状態で管理
 * - テスト可能なDI設計
 */
export function AuthProvider({
  children,
  authService = defaultAuthService,
  redirectToLineLogin = defaultRedirectToLineLogin,
}: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 初期化: トークンの存在をチェック
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsLoading(false)
    }

    checkAuth()

    // 他タブでのログイン/ログアウトを検知
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'accessToken') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [authService])

  // ログイン処理（LINE OAuth）
  const login = useCallback(() => {
    redirectToLineLogin()
  }, [redirectToLineLogin])

  // ログアウト処理
  const logout = useCallback(() => {
    authService.clearTokens()
    setIsAuthenticated(false)
  }, [authService])

  // トークン保存（OAuth callbackから呼ばれる）
  const setTokens = useCallback(
    (tokens: AuthTokens) => {
      authService.setTokens(tokens)
      setIsAuthenticated(true)
    },
    [authService]
  )

  // Context値をメモ化
  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      login,
      logout,
      setTokens,
    }),
    [isAuthenticated, isLoading, login, logout, setTokens]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
