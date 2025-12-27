import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RuleCard } from '../rule-card'
import type { AutoReplyRule } from '@/lib/api-client'

describe('RuleCard', () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnToggle = vi.fn()

  const followRule: AutoReplyRule = {
    id: '1',
    type: 'follow',
    name: 'フォロー返信',
    replyMessage: 'フォローありがとうございます',
    isEnabled: true,
    priority: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  const keywordRule: AutoReplyRule = {
    id: '2',
    type: 'keyword',
    name: '料金案内',
    keywords: ['料金', '値段'],
    matchType: 'partial',
    replyMessage: '料金についてはこちら',
    isEnabled: false,
    priority: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  it('should render follow type rule with correct styling', () => {
    render(
      <RuleCard
        rule={followRule}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )

    expect(screen.getByText('フォロー返信')).toBeInTheDocument()
    expect(screen.getByText('友だち追加時')).toBeInTheDocument()
    expect(screen.getByText('フォローありがとうございます')).toBeInTheDocument()
    expect(screen.getByText('有効')).toBeInTheDocument()
    expect(screen.getByText('優先度: 1')).toBeInTheDocument()
  })

  it('should render keyword type rule with keywords and match type', () => {
    render(
      <RuleCard
        rule={keywordRule}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )

    expect(screen.getByText('料金案内')).toBeInTheDocument()
    expect(screen.getByText('反応する言葉')).toBeInTheDocument()
    expect(screen.getByText(/反応する言葉: 料金, 値段/)).toBeInTheDocument()
    expect(screen.getByText(/部分一致/)).toBeInTheDocument()
    expect(screen.getByText('料金についてはこちら')).toBeInTheDocument()
    expect(screen.getByText('無効')).toBeInTheDocument()
    expect(screen.getByText('優先度: 2')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RuleCard
        rule={followRule}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )

    await user.click(screen.getByText('編集'))
    expect(mockOnEdit).toHaveBeenCalledWith(followRule)
  })

  it('should call onToggle when toggle button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RuleCard
        rule={followRule}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )

    await user.click(screen.getByText('有効'))
    expect(mockOnToggle).toHaveBeenCalledWith('1', false)
  })

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <RuleCard
        rule={followRule}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )

    await user.click(screen.getByText('削除'))
    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('should apply correct color for follow type', () => {
    const { container } = render(
      <RuleCard
        rule={followRule}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )

    const colorIndicator = container.querySelector('.bg-yellow-500')
    expect(colorIndicator).toBeInTheDocument()
  })

  it('should apply correct color for keyword type', () => {
    const { container } = render(
      <RuleCard
        rule={keywordRule}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
      />
    )

    const colorIndicator = container.querySelector('.bg-blue-500')
    expect(colorIndicator).toBeInTheDocument()
  })
})
