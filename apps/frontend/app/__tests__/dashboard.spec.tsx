import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../page'

describe('Dashboard UI', () => {
  it('カード4枚が glass スタイルで表示される', () => {
    const { container } = render(<HomePage />)
    const cards = container.querySelectorAll<HTMLDivElement>('.glass')
    expect(cards.length).toBe(4)
    expect(screen.getByText('友だち数')).toBeInTheDocument()
    expect(screen.getByText('今月の送信')).toBeInTheDocument()
    expect(screen.getByText('平均CTR')).toBeInTheDocument()
    expect(screen.getByText('今月の売上')).toBeInTheDocument()
  })

  it('テーブルのヘッダがモック通りに表示される', () => {
    render(<HomePage />)
    expect(screen.getByText('最近のキャンペーン')).toBeInTheDocument()
    expect(screen.getByText('キャンペーン名')).toBeInTheDocument()
    expect(screen.getByText('送信')).toBeInTheDocument()
    expect(screen.getByText('CTR')).toBeInTheDocument()
    expect(screen.getByText('CVR')).toBeInTheDocument()
    expect(screen.getByText('状態')).toBeInTheDocument()
  })

  it('更新クリックでティザー行が先頭に追加される', async () => {
    const user = userEvent.setup()
    const { container } = render(<HomePage />)
    const rowsBefore = container.querySelectorAll('tbody tr')
    expect(rowsBefore.length).toBe(3)

    await user.click(screen.getByRole('button', { name: '更新' }))

    const rowsAfter = container.querySelectorAll('tbody tr')
    expect(rowsAfter.length).toBe(4)
    const firstRow = rowsAfter[0]
    expect(firstRow.textContent ?? '').toContain('秋の感謝祭ティザー')
  })

  it('ステータスバッジの色が状態に対応している', async () => {
    const user = userEvent.setup()
    const { container } = render(<HomePage />)

    const findRow = (label: string): HTMLTableRowElement => {
      const rows = Array.from(container.querySelectorAll<HTMLTableRowElement>('tbody tr'))
      const hit = rows.find(r => (r.textContent ?? '').includes(label))
      if (!hit) throw new Error(`row not found: ${label}`)
      return hit
    }

    // 初期3行のクラス
    expect(findRow('夏のセール告知').querySelector('span')?.className).toMatch('bg-green-500/15')
    expect(findRow('新スタンプ発売').querySelector('span')?.className).toMatch('bg-red-500/15')
    expect(findRow('限定ライブ招待').querySelector('span')?.className).toMatch('bg-yellow-400/15')

    // 追加行（準備中=blue）
    await user.click(screen.getByRole('button', { name: '更新' }))
    expect(findRow('秋の感謝祭ティザー').querySelector('span')?.className).toMatch('bg-blue-500/15')
  })
})

