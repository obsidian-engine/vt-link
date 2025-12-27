import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'

/**
 * useAuth custom hook
 * AuthContextから認証状態を取得するカスタムフック
 * AuthProviderでラップされていない場合はエラーを投げる
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
