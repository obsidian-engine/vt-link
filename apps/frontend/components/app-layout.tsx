"use client"

import * as React from "react"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "./ui/button"
import { Sidebar } from "./sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border-b border-white/30 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold drop-shadow">VT-Line</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button className="hidden sm:inline-flex">
              新規メッセージ
            </Button>
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