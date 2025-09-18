"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
// shadcn削除: Buttonをプレーン要素へ置換

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg glass dark:glass-dark shadow-md hover:shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="text-sm">テーマ切替</span>
    </button>
  )
}
