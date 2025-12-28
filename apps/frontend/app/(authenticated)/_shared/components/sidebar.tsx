"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  History,
  Menu as MenuIcon,
  Settings,
  X,
  Grid3X3,
  MessageCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
// shadcn削除: Buttonをプレーン要素へ置換
import { ThemeToggle } from "@/app/_shared/components/theme-toggle"

const navigation = [
  { name: "ダッシュボード", href: "/", icon: LayoutDashboard, description: "統計と概要" },
  { name: "メッセージ", href: "/messages", icon: MessageSquare, description: "一斉配信" },
  { name: "オーディエンス", href: "/audience", icon: Users, description: "友だち管理" },
  { name: "履歴", href: "/history", icon: History, description: "配信履歴" },
  { name: "リッチメニュー", href: "/richmenu", icon: Grid3X3, description: "メニュー設定" },
  { name: "自動返信", href: "/autoreply", icon: MessageCircle, description: "自動応答" },
  { name: "設定", href: "/settings", icon: Settings, description: "アカウント設定" },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 shrink-0 backdrop-blur-lg bg-white/40 dark:bg-slate-800/40",
          "border-r border-white/30 dark:border-slate-700/60 flex flex-col gap-6 p-6",
          "sticky top-0 h-screen shadow-lg",
          "max-md:fixed max-md:top-0 max-md:h-dvh max-md:transition-all max-md:z-30",
          isOpen ? "max-md:left-0" : "max-md:-left-72"
        )}
        aria-label="メインナビゲーション"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="font-semibold text-xl text-primary drop-shadow">
            VT-Line
          </div>
          <button
            type="button"
            aria-label="サイドバーを閉じる"
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg hover:bg-primary/10 active:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 text-sm">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors group",
                  "hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:text-primary"
                )}
                onClick={() => setIsOpen(false)}
                title={item.description}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  <div className={cn(
                    "text-xs mt-0.5",
                    isActive ? "text-primary/70" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto space-y-3">
          <ThemeToggle />
          <p className="text-[11px] text-slate-600/80 dark:text-slate-300/80">
            ローカル優先・個人運用の軽量UI
          </p>
        </div>
      </aside>
    </>
  )
}
