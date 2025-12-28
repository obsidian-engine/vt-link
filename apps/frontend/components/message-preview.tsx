"use client"

import Image from 'next/image'

interface MessagePreviewProps {
  title: string
  body: string
  imageUrl?: string | null
  scheduledAt?: string | null
}

export function MessagePreview({ title, body, imageUrl, scheduledAt }: MessagePreviewProps) {
  const formatScheduledTime = (dateString: string | null | undefined) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          プレビュー
        </h3>
        {scheduledAt && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            配信予定: {formatScheduledTime(scheduledAt)}
          </span>
        )}
      </div>

      {/* LINE風チャットバブル */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
        {/* アイコンとメッセージエリア */}
        <div className="flex items-start space-x-3">
          {/* アイコン（仮のプレースホルダー） */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
              VT
            </div>
          </div>

          {/* メッセージ本体 */}
          <div className="flex-1 min-w-0">
            {/* 吹き出し */}
            <div className="bg-brand-primary text-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
              {/* タイトル */}
              {title && (
                <div className="font-bold mb-2 text-sm">
                  {title}
                </div>
              )}

              {/* 本文 */}
              {body && (
                <div className="whitespace-pre-wrap break-words text-sm">
                  {body}
                </div>
              )}

              {/* 画像 */}
              {imageUrl && (
                <div className="mt-3 relative w-full h-48">
                  <Image
                    src={imageUrl}
                    alt="プレビュー画像"
                    fill
                    className="rounded-md object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* タイムスタンプ */}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 px-2">
              {new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* 注意書き */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        ※ 実際の配信時の表示とは異なる場合があります
      </p>
    </div>
  )
}
