import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageUploader } from '../_components/image-uploader'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// グローバルfetchのモック
global.fetch = vi.fn()

describe('ImageUploader', () => {
  const mockOnUploadComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockClear()
  })

  it('初期状態でアップロードエリアが表示される', () => {
    render(<ImageUploader onUploadComplete={mockOnUploadComplete} />)

    expect(screen.getByText(/クリックまたはドラッグ&ドロップで画像を選択/i)).toBeInTheDocument()
    expect(screen.getByText(/PNG \/ JPEG（最大1MB）/i)).toBeInTheDocument()
  })

  it('現在の画像URLが渡された場合、プレビューが表示される', () => {
    const currentImageUrl = 'https://example.com/image.png'
    render(
      <ImageUploader
        onUploadComplete={mockOnUploadComplete}
        currentImageUrl={currentImageUrl}
      />
    )

    const img = screen.getByAltText('プレビュー') as HTMLImageElement
    expect(img).toBeInTheDocument()
    expect(img.src).toBe(currentImageUrl)
  })

  it('ファイル選択時にバリデーションエラー（MIME type）が表示される', async () => {
    const user = userEvent.setup()
    render(<ImageUploader onUploadComplete={mockOnUploadComplete} />)

    // MIME typeが明確に異なるファイルを作成
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const input = document.getElementById('file-upload') as HTMLInputElement

    // accept属性を一時的に削除してファイルをアップロード
    const originalAccept = input.accept
    input.accept = ''

    await user.upload(input, file)

    // accept属性を復元
    input.accept = originalAccept

    // エラーメッセージが表示されることを確認（タイムアウト付き）
    await waitFor(() => {
      expect(screen.getByText(/PNG または JPEG 形式の画像を選択してください/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    expect(mockOnUploadComplete).not.toHaveBeenCalled()
  })

  it('ファイル選択時にバリデーションエラー（サイズ超過）が表示される', async () => {
    const user = userEvent.setup()
    render(<ImageUploader onUploadComplete={mockOnUploadComplete} />)

    // 1MB超過のファイル（1024 * 1024 + 1バイト）
    const largeContent = new Array(1024 * 1024 + 1).fill('a').join('')
    const file = new File([largeContent], 'large.png', { type: 'image/png' })
    const input = document.getElementById('file-upload') as HTMLInputElement

    await user.upload(input, file)

    // エラーメッセージが表示されるまで待機
    const errorMessage = await screen.findByText(/ファイルサイズは1MB以下にしてください/i)
    expect(errorMessage).toBeInTheDocument()
    expect(mockOnUploadComplete).not.toHaveBeenCalled()
  })

  it('正常なファイル選択時にアップロードが成功する', async () => {
    const user = userEvent.setup()
    const uploadedUrl = 'https://example.com/uploaded.png'

    // fetch APIのモック
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: uploadedUrl })
    })

    render(<ImageUploader onUploadComplete={mockOnUploadComplete} />)

    const file = new File(['content'], 'test.png', { type: 'image/png' })
    const input = document.getElementById('file-upload') as HTMLInputElement

    await user.upload(input, file)

    // アップロード完了後の確認
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith(uploadedUrl)
    }, { timeout: 3000 })

    // プレビューが表示されることを確認
    const preview = await screen.findByAltText('プレビュー')
    expect(preview).toBeInTheDocument()

    // fetchが正しく呼ばれたことを確認
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/upload',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      })
    )
  })

  it('アップロード失敗時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup()

    // fetch APIのモック（失敗）
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(<ImageUploader onUploadComplete={mockOnUploadComplete} />)

    const file = new File(['content'], 'test.png', { type: 'image/png' })
    const input = document.getElementById('file-upload') as HTMLInputElement

    await user.upload(input, file)

    // エラーメッセージが表示されるまで待機
    const errorMessage = await screen.findByText(/アップロードに失敗しました/i)
    expect(errorMessage).toBeInTheDocument()
    expect(mockOnUploadComplete).not.toHaveBeenCalled()
  })

  it('プレビュー削除ボタンをクリックすると画像が削除される', async () => {
    const user = userEvent.setup()
    const currentImageUrl = 'https://example.com/image.png'

    render(
      <ImageUploader
        onUploadComplete={mockOnUploadComplete}
        currentImageUrl={currentImageUrl}
      />
    )

    // 初期状態でプレビュー表示確認
    expect(screen.getByAltText('プレビュー')).toBeInTheDocument()

    // 削除ボタンをクリック
    const removeButton = screen.getByRole('button')
    await user.click(removeButton)

    // プレビューが削除されたことを確認
    await waitFor(() => {
      expect(screen.queryByAltText('プレビュー')).not.toBeInTheDocument()
      expect(screen.getByText(/クリックまたはドラッグ&ドロップで画像を選択/i)).toBeInTheDocument()
    })
  })

  it('Drag & Drop でファイルをアップロードできる', async () => {
    const uploadedUrl = 'https://example.com/uploaded.png'

    // fetch APIのモック
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: uploadedUrl })
    })

    render(<ImageUploader onUploadComplete={mockOnUploadComplete} />)

    const file = new File(['content'], 'test.png', { type: 'image/png' })
    const dropZone = screen.getByText(/クリックまたはドラッグ&ドロップで画像を選択/i).closest('div')

    if (dropZone) {
      // ドラッグオーバーイベント
      const dragOverEvent = new Event('dragover', { bubbles: true })
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: {
          files: [file]
        }
      })
      dropZone.dispatchEvent(dragOverEvent)

      // ドロップイベント
      const dropEvent = new Event('drop', { bubbles: true })
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file]
        }
      })
      dropZone.dispatchEvent(dropEvent)

      // アップロード完了後の確認
      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith(uploadedUrl)
      })
    }
  })

  it('アップロード中は入力が無効化される', async () => {
    const user = userEvent.setup()

    // アップロードを遅延させるモック
    ;(global.fetch as any).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ url: 'https://example.com/uploaded.png' })
      }), 100))
    )

    render(<ImageUploader onUploadComplete={mockOnUploadComplete} />)

    const file = new File(['content'], 'test.png', { type: 'image/png' })
    const input = document.getElementById('file-upload') as HTMLInputElement

    await user.upload(input, file)

    // アップロード中の確認
    await waitFor(() => {
      expect(screen.getByText(/アップロード中.../i)).toBeInTheDocument()
      expect(input).toBeDisabled()
    }, { timeout: 3000 })

    // アップロード完了後の確認
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalled()
    }, { timeout: 3000 })
  })
})
