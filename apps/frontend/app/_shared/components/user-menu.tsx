"use client"

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { User, LogOut, Settings } from 'lucide-react'

interface UserMenuProps {
  onLogout: () => void
}

export function UserMenu({ onLogout }: UserMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
          aria-label="ユーザーメニュー"
        >
          <User className="h-5 w-5" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] bg-background rounded-lg shadow-lg border border-border p-1 z-50"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted focus:bg-muted focus:outline-none transition"
            onSelect={() => {
              // 設定ページへの遷移（将来実装）
              console.log('設定')
            }}
          >
            <Settings className="h-4 w-4" />
            <span>設定</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none transition"
            onSelect={onLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>ログアウト</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
