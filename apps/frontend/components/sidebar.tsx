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
import { ThemeToggle } from "./theme-toggle"

const navigation = [
  { name: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { name: "メッセージ", href: "/messages", icon: MessageSquare },
  { name: "オーディエンス", href: "/audience", icon: Users },
  { name: "履歴", href: "/history", icon: History },
  { name: "リッチメニュー", href: "/richmenu", icon: Grid3X3 },
  { name: "自動返信", href: "/autoreply", icon: MessageCircle },
  { name: "設定", href: "/settings", icon: Settings },
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
          "fixed left-0 top-0 z-30 h-screen w-64 shrink-0 transform backdrop-blur-lg",
          "bg-white/40 dark:bg-slate-800/40 border-r border-white/30 dark:border-slate-700/60",
          "flex flex-col gap-6 p-6 shadow-lg transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="font-semibold text-xl text-primary drop-shadow">
            VT-Line
          </div>
          <button
            type="button"
            aria-label="サイドバーを閉じる"
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={cn(
                  "h-4 w-4",
                  isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto space-y-3">
          <ThemeToggle />
          <p className="text-[11px] text-muted-foreground">
            ローカル優先・個人運用の軽量UI
          </p>
        </div>
      </aside>
    </>
  )
}
