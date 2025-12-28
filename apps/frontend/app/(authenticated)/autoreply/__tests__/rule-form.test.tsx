import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RuleForm } from '../_components/rule-form'
import type { AutoReplyRule } from '@/lib/api-client'

describe('RuleForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  it('should render form with default values for new rule', () => {
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    expect(screen.getByLabelText(/ルール名/)).toBeInTheDocument()
    expect(screen.getByLabelText(/返信メッセージ/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '作成する' })).toBeInTheDocument()
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

    expect(screen.getByRole('button', { name: '更新する' })).toBeInTheDocument()
  })

  it('should validate rule name length (max 50 characters)', async () => {
    const user = userEvent.setup()
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    const nameInput = screen.getByLabelText(/ルール名/) as HTMLInputElement
    const longName = 'a'.repeat(51)

    // maxLength属性を回避するため、プログラム的に値を設定
    fireEvent.change(nameInput, { target: { value: longName } })

    const submitButton = screen.getByRole('button', { name: '作成する' })
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
    const keywordTypeButton = screen.getByRole('button', { name: /反応する言葉/ })
    await user.click(keywordTypeButton)

    // 必須フィールドを入力
    await user.type(screen.getByLabelText(/ルール名/), 'テストルール')
    await user.type(screen.getByLabelText(/返信メッセージ/), 'テストメッセージ')

    // 11個のキーワードを入力
    const keywordsInput = screen.getByPlaceholderText(/例: 料金, 値段, いくら/)
    const keywords = Array(11).fill('keyword').join(', ')

    await user.clear(keywordsInput)
    await user.type(keywordsInput, keywords)

    const submitButton = screen.getByRole('button', { name: '作成する' })
    await user.click(submitButton)

    // バリデーションエラーメッセージの確認
    await waitFor(() => {
      expect(screen.getByText(/反応する言葉は最大10個まで/)).toBeInTheDocument()
    })
  })

  it('should validate reply message length (max 1000 characters)', async () => {
    const user = userEvent.setup()
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    const replyMessageInput = screen.getByLabelText(/返信メッセージ/) as HTMLTextAreaElement
    const longMessage = 'a'.repeat(1001)

    // maxLength属性を回避するため、プログラム的に値を設定
    fireEvent.change(replyMessageInput, { target: { value: longMessage } })

    const submitButton = screen.getByRole('button', { name: '作成する' })
    await user.click(submitButton)

    // バリデーションエラーメッセージの確認
    await waitFor(() => {
      expect(screen.getByText(/1000文字以内/)).toBeInTheDocument()
    })
  })

  it('should show keywords input only for keyword type', async () => {
    const user = userEvent.setup()
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    // 初期状態（キーワードタイプ）ではキーワード入力が表示
    expect(screen.getByPlaceholderText(/例: 料金, 値段, いくら/)).toBeInTheDocument()

    // 友だち追加時タイプに変更
    const followTypeButton = screen.getByRole('button', { name: /友だち追加時/ })
    await user.click(followTypeButton)

    // キーワード入力が非表示になる
    expect(screen.queryByPlaceholderText(/例: 料金, 値段, いくら/)).not.toBeInTheDocument()
  })

  it('should display LINE-style preview of reply message', async () => {
    const user = userEvent.setup()
    render(<RuleForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} existingRulesCount={0} />)

    // 返信メッセージを入力
    await user.type(screen.getByLabelText(/返信メッセージ/), 'テストメッセージ')

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

    // 友だち追加時タイプを選択（キーワード不要）
    const followTypeButton = screen.getByRole('button', { name: /友だち追加時/ })
    await user.click(followTypeButton)

    // フォームに入力
    await user.type(screen.getByLabelText(/ルール名/), 'テストルール')
    await user.type(screen.getByLabelText(/返信メッセージ/), 'テストメッセージ')

    // フォーム送信
    await user.click(screen.getByRole('button', { name: '作成する' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })
})
