'use client'

import { createContext, useEffect, useState, type ReactNode } from 'react'
import { setTokens, clearTokens, getAccessToken } from './authService'
import { makeClient } from '../api-client'

// User型定義（バックエンドのauth_handler.goのUser型と一致）
export interface User {
  id: string
  displayName: string
  pictureUrl?: string
  email?: string
}

// AuthContextValue型定義
export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => void
}

// AuthContext作成
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)

const USER_STORAGE_KEY = 'vt-link-user'

interface AuthProviderProps {
  children: ReactNode
}

// AuthProvider実装
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // login関数：トークンとユーザー情報を保存
  const login = (
    accessToken: string,
    refreshToken: string,
    userData: User
  ): void => {
    setTokens(accessToken, refreshToken)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  // logout関数：トークンとユーザー情報を削除
  const logout = (): void => {
    clearTokens()
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
  }

  // 初期チェック：localStorageからユーザー情報を復元
  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      try {
        const token = getAccessToken()
        if (!token) {
          setIsLoading(false)
          return
        }

        // localStorageからユーザー情報を取得
        const storedUser = localStorage.getItem(USER_STORAGE_KEY)
        if (storedUser) {
          const userData = JSON.parse(storedUser) as User
          setUser(userData)
        } else {
          // ユーザー情報がない場合、/auth/meを呼び出して取得を試みる
          const client = makeClient()
          const response = await client.GET<{ user_id: string }>('/auth/me')

          if (response.data?.user_id) {
            // 現在のバックエンド実装ではuser_idのみ返すため、最小限のUser情報を設定
            const userData: User = {
              id: response.data.user_id,
              displayName: 'User', // 暫定値
            }
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
            setUser(userData)
          } else {
            // 認証エラー時はクリア
            logout()
          }
        }
      } catch (error) {
        // エラー時はログアウト状態にする
        console.error('Auth initialization error:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    void initAuth()
  }, [])

  // storageイベント監視：他タブでのログイン/ログアウトを検知
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent): void => {
      // tokenUpdateイベントは既存のauth.tsから発火される
      if (event.key === 'accessToken' || event.key === USER_STORAGE_KEY) {
        const token = getAccessToken()
        const storedUser = localStorage.getItem(USER_STORAGE_KEY)

        if (token && storedUser) {
          // 他タブでログインした
          const userData = JSON.parse(storedUser) as User
          setUser(userData)
        } else {
          // 他タブでログアウトした
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
