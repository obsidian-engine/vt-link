'use client'

import { createContext, useEffect, useState, type ReactNode } from 'react'
import { getCsrfToken } from './authService'

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
  login: (user: User) => void
  logout: () => Promise<void>
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

  // login関数：ユーザー情報を保存
  const login = (userData: User): void => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  // logout関数：バックエンドにログアウトリクエストを送信
  const logout = async (): Promise<void> => {
    try {
      const csrfToken = getCsrfToken()
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken || '',
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem(USER_STORAGE_KEY)
      setUser(null)
    }
  }

  // 初期チェック：localStorageからユーザー情報を復元
  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      try {
        // Cookie から認証状態を判定するため、localStorageからユーザー情報を取得
        const storedUser = localStorage.getItem(USER_STORAGE_KEY)
        if (storedUser) {
          const userData = JSON.parse(storedUser) as User
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        await logout()
      } finally {
        setIsLoading(false)
      }
    }

    void initAuth()
  }, [])

  // storageイベント監視：他タブでのログイン/ログアウトを検知
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === USER_STORAGE_KEY) {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY)

        if (storedUser) {
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
