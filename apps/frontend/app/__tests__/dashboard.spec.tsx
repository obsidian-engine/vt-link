import { render, screen } from '@testing-library/react'
import HomePage from '../page'

describe('Dashboard UI', () => {
  it('カード4枚が glass スタイルで表示される', () => {
    const { container } = render(<HomePage />)
    const cards = container.querySelectorAll<HTMLDivElement>('.glass')
    expect(cards.length).toBe(5)
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

  it('ステータスバッジの色が状態に対応している', () => {
    const { container } = render(<HomePage />)

    const findRow = (label: string): HTMLTableRowElement => {
      const rows = Array.from(container.querySelectorAll<HTMLTableRowElement>('tbody tr'))
      const hit = rows.find(r => (r.textContent ?? '').includes(label))
      if (!hit) throw new Error(`row not found: ${label}`)
      return hit
    }

    // 初期3行のクラス（静的状態のみ）
    expect(findRow('夏のセール告知').querySelector('span')?.className).toMatch('bg-green-500/15')
    expect(findRow('新スタンプ発売').querySelector('span')?.className).toMatch('bg-red-500/15')
    expect(findRow('限定ライブ招待').querySelector('span')?.className).toMatch('bg-yellow-400/15')
  })
})

