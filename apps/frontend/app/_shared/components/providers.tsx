'use client'

import { type ReactNode } from 'react'
import { Toaster } from 'sonner'
import { ThemeProvider } from './theme-provider'
import { AuthProvider } from '@/lib/auth'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vt-line-ui-theme">
      <AuthProvider>
        {children}
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  )
}
