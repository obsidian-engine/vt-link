'use client'

import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'

/**
 * 認証フック
 *
 * 使用例:
 * ```tsx
 * const { isAuthenticated, isLoading, login, logout, setTokens } = useAuth()
 *
 * if (isLoading) return <Loading />
 * if (!isAuthenticated) return <LoginPrompt />
 * ```
 *
 * @throws AuthProvider外で使用された場合にエラー
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
