import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RuleForm } from '../rule-form'
import type { AutoReplyRule } from '@/lib/api-client'

describe('RuleForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  it('should render form with default values for new rule', () => {
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    expect(screen.getByText('新しいルールを作成')).toBeInTheDocument()
    expect(screen.getByLabelText('ルール名')).toBeInTheDocument()
    expect(screen.getByLabelText('返信メッセージ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '作成' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
  })

  it('should render form with existing rule data for edit mode', () => {
    const existingRule: AutoReplyRule = {
      id: '1',
      type: 'keyword',
      name: '料金案内',
      keywords: ['料金', '値段'],
      matchType: 'partial',
      replyMessage: '料金についてはこちら',
      isEnabled: true,
      priority: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    render(
      <RuleForm
        rule={existingRule}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        existingRulesCount={0}
      />
    )

    expect(screen.getByText('ルールを編集')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument()
  })

  it('should validate rule name length (max 50 characters)', async () => {
    const user = userEvent.setup()
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    const nameInput = screen.getByLabelText('ルール名')
    const longName = 'a'.repeat(51)

    await user.clear(nameInput)
    await user.type(nameInput, longName)

    const submitButton = screen.getByRole('button', { name: '作成' })
    await user.click(submitButton)

    // バリデーションエラーメッセージの確認
    await waitFor(() => {
      expect(screen.getByText(/50文字以内/)).toBeInTheDocument()
    })
  })

  it('should validate keywords count (max 10)', async () => {
    const user = userEvent.setup()
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    // キーワードタイプを選択
    const keywordTypeRadio = screen.getByLabelText('反応する言葉')
    await user.click(keywordTypeRadio)

    // 11個のキーワードを入力
    const keywordsInput = screen.getByPlaceholderText(/料金, 値段/)
    const keywords = Array(11).fill('keyword').join(', ')

    await user.clear(keywordsInput)
    await user.type(keywordsInput, keywords)

    const submitButton = screen.getByRole('button', { name: '作成' })
    await user.click(submitButton)

    // バリデーションエラーメッセージの確認
    await waitFor(() => {
      expect(screen.getByText(/10個以内/)).toBeInTheDocument()
    })
  })

  it('should validate reply message length (max 1000 characters)', async () => {
    const user = userEvent.setup()
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    const replyMessageInput = screen.getByLabelText('返信メッセージ')
    const longMessage = 'a'.repeat(1001)

    await user.clear(replyMessageInput)
    await user.type(replyMessageInput, longMessage)

    const submitButton = screen.getByRole('button', { name: '作成' })
    await user.click(submitButton)

    // バリデーションエラーメッセージの確認
    await waitFor(() => {
      expect(screen.getByText(/1000文字以内/)).toBeInTheDocument()
    })
  })

  it('should show keywords input only for keyword type', async () => {
    const user = userEvent.setup()
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    // 初期状態（友だち追加時）ではキーワード入力が非表示
    expect(screen.queryByPlaceholderText(/料金, 値段/)).not.toBeInTheDocument()

    // キーワードタイプに変更
    const keywordTypeRadio = screen.getByLabelText('反応する言葉')
    await user.click(keywordTypeRadio)

    // キーワード入力が表示される
    expect(screen.getByPlaceholderText(/料金, 値段/)).toBeInTheDocument()
  })

  it('should display LINE-style preview of reply message', () => {
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    // プレビュー表示の確認
    expect(screen.getByText('プレビュー')).toBeInTheDocument()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    await user.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    // フォームに入力
    await user.type(screen.getByLabelText('ルール名'), 'テストルール')
    await user.type(screen.getByLabelText('返信メッセージ'), 'テストメッセージ')

    // フォーム送信
    await user.click(screen.getByRole('button', { name: '作成' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })
})
