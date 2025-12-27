/**
 * 認証モジュール
 *
 * エクスポート:
 * - AuthProvider: 認証状態を提供するProvider
 * - useAuth: 認証状態を取得するフック
 * - authService: localStorage操作（直接使用は非推奨、テスト用）
 * - redirectToLineLogin: LINE OAuth認証へリダイレクト
 *
 * 使用例:
 * ```tsx
 * // app/layout.tsx
 * import { AuthProvider } from '@/lib/auth'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <AuthProvider>
 *       {children}
 *     </AuthProvider>
 *   )
 * }
 *
 * // 認証が必要なコンポーネント
 * import { useAuth } from '@/lib/auth'
 *
 * function Dashboard() {
 *   const { isAuthenticated, isLoading, logout } = useAuth()
 *   // ...
 * }
 * ```
 */

// Provider & Context
export { AuthProvider, AuthContext } from './AuthContext'
export type { AuthContextValue, AuthState } from './AuthContext'

// Hook
export { useAuth } from './useAuth'

// Service (for advanced use cases and testing)
export {
  authService,
  createAuthService,
  redirectToLineLogin,
  getLineLoginUrl,
} from './authService'
export type { AuthService, AuthTokens, StorageAdapter } from './authService'
