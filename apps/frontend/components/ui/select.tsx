import * as React from "react"
import { cn } from "@/lib/utils"

// Simplified select components for demo
const Select = ({ children, defaultValue, onValueChange }: {
  children: React.ReactNode
  defaultValue?: string
  onValueChange?: (value: string) => void
}) => {
  return <div className="relative">{children}</div>
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-white/70 dark:bg-slate-800/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="text-muted-foreground">{placeholder || "選択してください"}</span>
)

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-input rounded-lg shadow-lg z-50">
    {children}
  </div>
)

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <div className="px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
    {children}
  </div>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }