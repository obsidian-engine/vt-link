"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu } from "lucide-react"
// shadcn削除: Buttonをプレーン要素へ置換
import { Sidebar } from "./sidebar"
import { isAuthenticated, clearTokens } from "@/lib/auth"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsLoggedIn(authenticated)
      setIsLoading(false)

      // Redirect to login if not authenticated and not on login/auth pages
      if (!authenticated && !pathname.startsWith('/login') && !pathname.startsWith('/auth')) {
        router.push('/login')
      }
    }

    checkAuth()

    // Listen for storage changes (when tokens are set from another tab/window)
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)

    // Custom event for same-window token updates
    const handleTokenUpdate = () => {
      checkAuth()
    }
    window.addEventListener('tokenUpdate', handleTokenUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tokenUpdate', handleTokenUpdate)
    }
  }, [pathname, router])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      clearTokens()
      setIsLoggedIn(false)
      router.push('/login')
    }
  }

  // Don't show layout for login/auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/auth')) {
    return <>{children}</>
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  // Don't show layout if not logged in (will redirect)
  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-b border-white/30 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="サイドバーを開く"
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold drop-shadow">ダッシュボード</h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button" 
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              新規メッセージ
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              ログアウト
            </button>
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shadow-md">
              SA
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12">
          {children}
        </main>
      </div>
    </div>
  )
}
