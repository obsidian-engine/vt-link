import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import NewMessagePage from '../page'

// useRouterのモック
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// APIクライアントのモック
vi.mock('@/lib/api-client', () => ({
  makeClient: () => ({
    POST: vi.fn(() => Promise.resolve({ data: { ok: true }, error: null })),
  }),
}))

describe('NewMessagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本表示のテスト', () => {
    it('ページタイトルが表示される', () => {
      render(<NewMessagePage />)
      expect(screen.getByText('新規メッセージ作成')).toBeInTheDocument()
    })

    it('必須フィールドが表示される', () => {
      render(<NewMessagePage />)
      expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument()
      expect(screen.getByLabelText(/本文/)).toBeInTheDocument()
    })

    it('オプションフィールドが表示される', () => {
      render(<NewMessagePage />)
      expect(screen.getByLabelText(/画像URL/)).toBeInTheDocument()
      expect(screen.getByLabelText(/配信予定日時/)).toBeInTheDocument()
      expect(screen.getByLabelText(/ステータス/)).toBeInTheDocument()
    })

    it('配信するボタンが表示される', () => {
      render(<NewMessagePage />)
      expect(screen.getByRole('button', { name: /配信する/ })).toBeInTheDocument()
    })
  })

  describe('ステータスフィールドの仕様確認（重要）', () => {
    it('ステータス選択肢に「下書き」が含まれる', () => {
      render(<NewMessagePage />)
      expect(screen.getByRole('option', { name: '下書き' })).toBeInTheDocument()
    })

    it('ステータス選択肢に「配信予定」が含まれる', () => {
      render(<NewMessagePage />)
      expect(screen.getByRole('option', { name: '配信予定' })).toBeInTheDocument()
    })

    it('ステータス選択肢に「配信済み」が含まれない（schema-zod準拠）', () => {
      render(<NewMessagePage />)
      expect(screen.queryByRole('option', { name: '配信済み' })).not.toBeInTheDocument()
    })
  })
})
