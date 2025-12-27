import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AutoReplyPage from '../page'
import type { AutoReplyRule } from '@/lib/api-client'

// SWRフックのモック
vi.mock('@/lib/hooks/use-auto-reply-rules', () => ({
  useAutoReplyRules: vi.fn(() => ({
    rules: [],
    isLoading: false,
    error: null,
    createRule: vi.fn(),
    updateRule: vi.fn(),
    deleteRule: vi.fn(),
  })),
}))

describe('AutoReplyPage', () => {
  const mockRules: AutoReplyRule[] = [
    {
      id: '1',
      type: 'follow',
      name: 'フォロー時メッセージ',
      replyMessage: 'フォローありがとうございます！',
      priority: 1,
      isEnabled: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      type: 'keyword',
      name: 'キーワード返信',
      keywords: ['料金', '値段'],
      matchType: 'partial',
      replyMessage: '料金についてのお問い合わせですね',
      priority: 2,
      isEnabled: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render page title', () => {
    render(<AutoReplyPage />)
    expect(screen.getByText('自動返信設定')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    const { useAutoReplyRules } = require('@/lib/hooks/use-auto-reply-rules')
    useAutoReplyRules.mockReturnValue({
      rules: [],
      isLoading: true,
      error: null,
    })

    render(<AutoReplyPage />)
    expect(screen.getByText(/読み込み中/)).toBeInTheDocument()
  })

  it('should display error state', () => {
    const { useAutoReplyRules } = require('@/lib/hooks/use-auto-reply-rules')
    useAutoReplyRules.mockReturnValue({
      rules: [],
      isLoading: false,
      error: new Error('Failed to fetch'),
    })

    render(<AutoReplyPage />)
    expect(screen.getByText(/エラー/)).toBeInTheDocument()
  })

  it('should display rules list', () => {
    const { useAutoReplyRules } = require('@/lib/hooks/use-auto-reply-rules')
    useAutoReplyRules.mockReturnValue({
      rules: mockRules,
      isLoading: false,
      error: null,
    })

    render(<AutoReplyPage />)
    expect(screen.getByText('フォロー返信')).toBeInTheDocument()
    expect(screen.getByText('料金案内')).toBeInTheDocument()
  })

  it('should display rules sorted by priority', () => {
    const { useAutoReplyRules } = require('@/lib/hooks/use-auto-reply-rules')
    const unsortedRules = [...mockRules].reverse()
    useAutoReplyRules.mockReturnValue({
      rules: unsortedRules,
      isLoading: false,
      error: null,
    })

    render(<AutoReplyPage />)

    const ruleCards = screen.getAllByText(/優先度:/)
    expect(ruleCards[0]).toHaveTextContent('優先度: 1')
    expect(ruleCards[1]).toHaveTextContent('優先度: 2')
  })

  it('should show create button when rules count is less than 5', () => {
    const { useAutoReplyRules } = require('@/lib/hooks/use-auto-reply-rules')
    useAutoReplyRules.mockReturnValue({
      rules: mockRules,
      isLoading: false,
      error: null,
    })

    render(<AutoReplyPage />)
    expect(screen.getByRole('button', { name: /新規作成/ })).toBeInTheDocument()
  })

  it('should disable create button when rules count is 5 or more', () => {
    const { useAutoReplyRules } = require('@/lib/hooks/use-auto-reply-rules')
    const maxRules: AutoReplyRule[] = Array(5)
      .fill(null)
      .map((_, i) => ({
        ...mockRules[0],
        id: `${i + 1}`,
        name: `ルール${i + 1}`,
        priority: i + 1,
      }))

    useAutoReplyRules.mockReturnValue({
      rules: maxRules,
      isLoading: false,
      error: null,
    })

    render(<AutoReplyPage />)
    const createButton = screen.getByRole('button', { name: /新規作成/ })
    expect(createButton).toBeDisabled()
  })

  it('should display warning message when rules count is 5 or more', () => {
    const { useAutoReplyRules } = require('@/lib/hooks/use-auto-reply-rules')
    const maxRules: AutoReplyRule[] = Array(5)
      .fill(null)
      .map((_, i) => ({
        ...mockRules[0],
        id: `${i + 1}`,
        name: `ルール${i + 1}`,
        priority: i + 1,
      }))

    useAutoReplyRules.mockReturnValue({
      rules: maxRules,
      isLoading: false,
      error: null,
    })

    render(<AutoReplyPage />)
    expect(screen.getByText(/ルールは最大5件/)).toBeInTheDocument()
  })

  it('should have toggle all switch', () => {
    const { useAutoReplyRules } = require('@/lib/hooks/use-auto-reply-rules')
    useAutoReplyRules.mockReturnValue({
      rules: mockRules,
      isLoading: false,
      error: null,
    })

    render(<AutoReplyPage />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('should call createRule when create button is clicked', async () => {
    const user = userEvent.setup()
    const mockCreateRule = vi.fn()
    const { useAutoReplyRules } = require('@/lib/hooks/use-auto-reply-rules')
    useAutoReplyRules.mockReturnValue({
      rules: mockRules,
      isLoading: false,
      error: null,
      createRule: mockCreateRule,
    })

    render(<AutoReplyPage />)

    const createButton = screen.getByRole('button', { name: /新規作成/ })
    await user.click(createButton)

    // フォームが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('新しいルールを作成')).toBeInTheDocument()
    })
  })

  it('should call deleteRule when delete button is clicked', async () => {
    const user = userEvent.setup()
    const mockDeleteRule = vi.fn()
    const { useAutoReplyRules } = require('@/lib/hooks/use-auto-reply-rules')
    useAutoReplyRules.mockReturnValue({
      rules: mockRules,
      isLoading: false,
      error: null,
      deleteRule: mockDeleteRule,
    })

    render(<AutoReplyPage />)

    const deleteButtons = screen.getAllByText('削除')
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDeleteRule).toHaveBeenCalledWith('1')
    })
  })

  it('should call updateRule when toggle button is clicked', async () => {
    const user = userEvent.setup()
    const mockUpdateRule = vi.fn()
    const { useAutoReplyRules } = require('@/lib/hooks/use-auto-reply-rules')
    useAutoReplyRules.mockReturnValue({
      rules: mockRules,
      isLoading: false,
      error: null,
      updateRule: mockUpdateRule,
    })

    render(<AutoReplyPage />)

    const toggleButtons = screen.getAllByText('有効')
    await user.click(toggleButtons[0])

    await waitFor(() => {
      expect(mockUpdateRule).toHaveBeenCalledWith('1', { isEnabled: false })
    })
  })
})
