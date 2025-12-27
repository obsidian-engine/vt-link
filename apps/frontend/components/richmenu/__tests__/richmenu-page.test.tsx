import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
// import { RichMenuPage } from '../richmenu-page'

/**
 * RichMenuPageの統合テスト
 *
 * TODO: 以下のテストケースを実装してください：
 * 1. ステップ1（テンプレート選択）が初期表示される
 * 2. テンプレート選択後、ステップ2（画像アップロード）に進む
 * 3. 画像アップロード後、ステップ3（エリア設定）に進む
 * 4. 全ステップ完了後、保存ボタンが有効になる
 * 5. 保存ボタンクリック時にAPIが呼ばれる
 * 6. 既存メニューの編集時、初期値が正しく表示される
 * 7. バリデーションエラーがある場合、次のステップに進めない
 * 8. 前のステップに戻ることができる
 * 9. キャンセルボタンをクリックするとフォームがリセットされる
 */

describe('RichMenuPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.todo('ステップ1（テンプレート選択）が初期表示される')

  it.todo('テンプレート選択後、ステップ2（画像アップロード）に進む')

  it.todo('画像アップロード後、ステップ3（エリア設定）に進む')

  it.todo('全ステップ完了後、保存ボタンが有効になる')

  it.todo('保存ボタンクリック時にAPIが呼ばれる')

  it.todo('既存メニューの編集時、初期値が正しく表示される')

  it.todo('バリデーションエラーがある場合、次のステップに進めない')

  it.todo('前のステップに戻ることができる')

  it.todo('キャンセルボタンをクリックするとフォームがリセットされる')
})
