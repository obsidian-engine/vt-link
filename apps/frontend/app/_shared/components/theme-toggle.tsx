"use client"

import * as React from "react"
import { Moon, Sun, Loader2 } from "lucide-react"
import { useTheme } from "./theme-provider"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  disabled?: boolean
  className?: string
}

export function ThemeToggle({ disabled = false, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleToggle = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    // テーマ切替時の微小なディレイで視覚的フィードバック
    await new Promise((resolve) => setTimeout(resolve, 150))
    setTheme(theme === "light" ? "dark" : "light")
    setIsLoading(false)
  }

  const isDisabled = disabled || isLoading

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-label={`テーマを${theme === "light" ? "ダーク" : "ライト"}モードに切り替える`}
      className={cn(
        "w-full min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-lg",
        "glass dark:glass-dark shadow-md transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        // 状態別スタイル
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-lg active:shadow-sm active:scale-[0.98]",
        className
      )}
    >
      <div className="relative w-4 h-4">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute inset-0" aria-hidden="true" />
            <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute inset-0" aria-hidden="true" />
          </>
        )}
      </div>
      <span className="text-sm">
        {isLoading ? "切替中..." : "テーマ切替"}
      </span>
    </button>
  )
}
