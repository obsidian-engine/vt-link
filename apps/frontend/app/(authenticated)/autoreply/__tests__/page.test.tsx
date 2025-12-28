import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AutoReplyPage from '../page'
import type { AutoReplyRule } from '@/lib/api-client'
import { useAutoReplyRules } from '../_hooks/use-auto-reply-rules'

// SWRフックのモック
vi.mock('../_hooks/use-auto-reply-rules', () => ({
  useAutoReplyRules: vi.fn(() => ({
    rules: [],
    isLoading: false,
    isError: false,
    mutate: vi.fn(),
  })),
  createRule: vi.fn(),
  updateRule: vi.fn(),
  deleteRule: vi.fn(),
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
    // window.confirmとalertをモック
    global.confirm = vi.fn(() => true)
    global.alert = vi.fn()
  })

  it('should render page title', () => {
    render(<AutoReplyPage />)
    expect(screen.getByText('自動返信ルール')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    (useAutoReplyRules as ReturnType<typeof vi.fn>).mockReturnValue({
      rules: [],
      isLoading: true,
      isError: false,
      mutate: vi.fn(),
    })

    render(<AutoReplyPage />)
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('should display error state', () => {
    (useAutoReplyRules as ReturnType<typeof vi.fn>).mockReturnValue({
      rules: [],
      isLoading: false,
      isError: true,
      mutate: vi.fn(),
    })

    render(<AutoReplyPage />)
    expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument()
  })

  it('should display rules list', () => {
    (useAutoReplyRules as ReturnType<typeof vi.fn>).mockReturnValue({
      rules: mockRules,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<AutoReplyPage />)
    expect(screen.getByText('フォロー時メッセージ')).toBeInTheDocument()
    expect(screen.getByText('キーワード返信')).toBeInTheDocument()
  })

  it('should display rules sorted by priority', () => {
    const unsortedRules = [...mockRules].reverse()
    ;(useAutoReplyRules as ReturnType<typeof vi.fn>).mockReturnValue({
      rules: unsortedRules,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<AutoReplyPage />)

    const ruleCards = screen.getAllByText(/優先度:/)
    expect(ruleCards[0]).toHaveTextContent('優先度: 2')
    expect(ruleCards[1]).toHaveTextContent('優先度: 1')
  })

  it('should show create button when rules count is less than 5', () => {
    (useAutoReplyRules as ReturnType<typeof vi.fn>).mockReturnValue({
      rules: mockRules,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<AutoReplyPage />)
    expect(screen.getByRole('button', { name: /新規ルール追加/ })).toBeInTheDocument()
  })

  it('should disable create button when rules count is 5 or more', () => {
    const maxRules = Array.from({ length: 5 }, (_, i) => ({
      ...mockRules[0],
      id: String(i + 1),
      name: `ルール${i + 1}`,
      priority: i + 1,
    })) as AutoReplyRule[]

    (useAutoReplyRules as ReturnType<typeof vi.fn>).mockReturnValue({
      rules: maxRules,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<AutoReplyPage />)
    const createButton = screen.getByRole('button', { name: /新規ルール追加/ })
    expect(createButton).toBeDisabled()
  })

  it('should display warning message when rules count is 5 or more', () => {
    const maxRules = Array.from({ length: 5 }, (_, i) => ({
      ...mockRules[0],
      id: String(i + 1),
      name: `ルール${i + 1}`,
      priority: i + 1,
    })) as AutoReplyRule[]

    (useAutoReplyRules as ReturnType<typeof vi.fn>).mockReturnValue({
      rules: maxRules,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<AutoReplyPage />)
    expect(screen.getByText('5/5件のルールが登録されています')).toBeInTheDocument()
  })

  it('should have toggle all switch', () => {
    (useAutoReplyRules as ReturnType<typeof vi.fn>).mockReturnValue({
      rules: mockRules,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<AutoReplyPage />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should call createRule when create button is clicked', async () => {
    (useAutoReplyRules as ReturnType<typeof vi.fn>).mockReturnValue({
      rules: mockRules,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<AutoReplyPage />)

    const createButton = screen.getByRole('button', { name: /新規ルール追加/ })
    fireEvent.click(createButton)

    // フォームが表示されることを確認
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '新規ルール追加' })).toBeInTheDocument()
    })
  })

  it('should call deleteRule when delete button is clicked', async () => {
    const user = userEvent.default?.setup() ?? userEvent.setup()
    const mockDeleteRule = vi.fn()
    const { deleteRule } = await import('../_hooks/use-auto-reply-rules')
    ;(deleteRule as ReturnType<typeof vi.fn>).mockImplementation(mockDeleteRule)
    ;(useAutoReplyRules as ReturnType<typeof vi.fn>).mockReturnValue({
      rules: mockRules,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<AutoReplyPage />)

    const deleteButtons = screen.getAllByText('削除')
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDeleteRule).toHaveBeenCalledWith('2')
    })
  })

  it('should call updateRule when toggle button is clicked', async () => {
    const user = userEvent.default?.setup() ?? userEvent.setup()
    const mockUpdateRule = vi.fn()
    const { updateRule } = await import('../_hooks/use-auto-reply-rules')
    ;(updateRule as ReturnType<typeof vi.fn>).mockImplementation(mockUpdateRule)
    ;(useAutoReplyRules as ReturnType<typeof vi.fn>).mockReturnValue({
      rules: mockRules,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    })

    render(<AutoReplyPage />)

    const toggleButtons = screen.getAllByText('有効')
    await user.click(toggleButtons[0])

    await waitFor(() => {
      expect(mockUpdateRule).toHaveBeenCalledWith('2', { isEnabled: false })
    })
  })
})
