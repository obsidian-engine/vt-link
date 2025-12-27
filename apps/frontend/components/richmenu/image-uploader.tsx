'use client'
import { useState, useCallback } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void
  currentImageUrl?: string
}

export function ImageUploader({ onUploadComplete, currentImageUrl }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    // MIME typeチェック
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      return 'PNG または JPEG 形式の画像を選択してください'
    }

    // ファイルサイズチェック（1MB）
    if (file.size > 1024 * 1024) {
      return 'ファイルサイズは1MB以下にしてください'
    }

    return null
  }

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null)

      // バリデーション
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      try {
        setIsUploading(true)

        // Vercel Blob にアップロード
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('アップロードに失敗しました')
        }

        const { url } = await response.json()

        setPreviewUrl(url)
        onUploadComplete(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
      } finally {
        setIsUploading(false)
      }
    },
    [onUploadComplete]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleRemove = () => {
    setPreviewUrl(undefined)
    setError(null)
  }

  return (
    <div className="space-y-4">
      {!previewUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        >
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileInput}
            disabled={isUploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isUploading ? 'アップロード中...' : 'クリックまたはドラッグ&ドロップで画像を選択'}
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG / JPEG（最大1MB）</p>
          </label>
        </div>
      ) : (
        <div className="relative">
          <img src={previewUrl} alt="プレビュー" className="w-full rounded-lg border border-gray-300" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
