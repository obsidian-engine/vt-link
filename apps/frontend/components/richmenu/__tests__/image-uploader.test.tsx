import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageUploader } from '../image-uploader'
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

    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(/クリックまたはドラッグ&ドロップで画像を選択/i).parentElement?.querySelector('input[type="file"]') as HTMLInputElement

    if (input) {
      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/PNG または JPEG 形式の画像を選択してください/i)).toBeInTheDocument()
      })
    }

    expect(mockOnUploadComplete).not.toHaveBeenCalled()
  })

  it('ファイル選択時にバリデーションエラー（サイズ超過）が表示される', async () => {
    const user = userEvent.setup()
    render(<ImageUploader onUploadComplete={mockOnUploadComplete} />)

    // 1MB超過のファイル（1024 * 1024 + 1バイト）
    const largeContent = new Array(1024 * 1024 + 1).fill('a').join('')
    const file = new File([largeContent], 'large.png', { type: 'image/png' })
    const input = screen.getByLabelText(/クリックまたはドラッグ&ドロップで画像を選択/i).parentElement?.querySelector('input[type="file"]') as HTMLInputElement

    if (input) {
      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/ファイルサイズは1MB以下にしてください/i)).toBeInTheDocument()
      })
    }

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
    const input = screen.getByLabelText(/クリックまたはドラッグ&ドロップで画像を選択/i).parentElement?.querySelector('input[type="file"]') as HTMLInputElement

    if (input) {
      await user.upload(input, file)

      // アップロード中の表示確認
      await waitFor(() => {
        expect(screen.getByText(/アップロード中.../i)).toBeInTheDocument()
      })

      // アップロード完了後の確認
      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalledWith(uploadedUrl)
        expect(screen.getByAltText('プレビュー')).toBeInTheDocument()
      })

      // fetchが正しく呼ばれたことを確認
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      )
    }
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
    const input = screen.getByLabelText(/クリックまたはドラッグ&ドロップで画像を選択/i).parentElement?.querySelector('input[type="file"]') as HTMLInputElement

    if (input) {
      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/アップロードに失敗しました/i)).toBeInTheDocument()
      })
    }

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
    const input = screen.getByLabelText(/クリックまたはドラッグ&ドロップで画像を選択/i).parentElement?.querySelector('input[type="file"]') as HTMLInputElement

    if (input) {
      await user.upload(input, file)

      // アップロード中の確認
      await waitFor(() => {
        expect(screen.getByText(/アップロード中.../i)).toBeInTheDocument()
        expect(input).toBeDisabled()
      })

      // アップロード完了後の確認
      await waitFor(() => {
        expect(mockOnUploadComplete).toHaveBeenCalled()
      }, { timeout: 2000 })
    }
  })
})
