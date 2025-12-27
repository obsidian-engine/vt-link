'use client'

import { type ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'
import { AuthProvider } from '@/lib/auth'
import { AppLayout } from './app-layout'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vt-line-ui-theme">
      <AuthProvider>
        <AppLayout>{children}</AppLayout>
      </AuthProvider>
    </ThemeProvider>
  )
}
