'use client'
import * as React from 'react'
import { useCreateMessageForm, type FormValues } from './useCreateMessageForm'
import { makeClient } from '../../../lib/api-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessagePreview } from '../../../components/message-preview'
import { ConfirmDialog } from '../../../components/confirm-dialog'

const client = makeClient()

export default function NewMessagePage() {
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useCreateMessageForm()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pendingValues, setPendingValues] = React.useState<FormValues | null>(null)

  // フォーム値をリアルタイム監視
  const watchedValues = watch()

  const onSubmit = async (values: FormValues) => {
    // 確認ダイアログを表示
    setPendingValues(values)
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!pendingValues) return

    try {
      const res = await client.POST('/api/v1/messages', { body: pendingValues })
      if (res.error) {
        throw new Error('メッセージの配信に失敗しました')
      }
      router.push('/messages')
    } catch (error) {
      console.error('Error creating message:', error)
      alert('エラーが発生しました')
    } finally {
      setPendingValues(null)
    }
  }

  return (
    <main className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            href="/messages"
            className="text-blue-600 hover:text-blue-800"
          >
            ← 一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold">新規メッセージ作成</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側: フォーム */}
          <form
            className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                タイトル *
              </label>
              <input
                id="title"
                type="text"
                className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                本文 *
              </label>
              <textarea
                id="body"
                rows={6}
                className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...register('body')}
              />
              {errors.body && (
                <p className="text-sm text-red-600 mt-1">{errors.body.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                画像URL
              </label>
              <input
                id="imageUrl"
                type="url"
                className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...register('imageUrl')}
              />
              {errors.imageUrl && (
                <p className="text-sm text-red-600 mt-1">{errors.imageUrl.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                配信予定日時
              </label>
              <input
                id="scheduledAt"
                type="datetime-local"
                className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...register('scheduledAt')}
              />
              {errors.scheduledAt && (
                <p className="text-sm text-red-600 mt-1">{errors.scheduledAt.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ステータス
              </label>
              <select
                id="status"
                className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...register('status')}
              >
                <option value="draft">下書き</option>
                <option value="scheduled">配信予定</option>
                <option value="sent">配信済み</option>
              </select>
              {errors.status && (
                <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSubmitting ? '配信中…' : '配信する'}
              </button>
              <Link
                href="/messages"
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                キャンセル
              </Link>
            </div>
          </form>

          {/* 右側: プレビュー */}
          <div className="sticky top-6 h-fit">
            <MessagePreview
              title={watchedValues.title || ''}
              body={watchedValues.body || ''}
              imageUrl={watchedValues.imageUrl}
              scheduledAt={watchedValues.scheduledAt}
            />
          </div>
        </div>
      </div>

      {/* 確認ダイアログ */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="メッセージを配信しますか？"
        description="この操作は取り消せません。配信してもよろしいですか？"
        confirmLabel="配信する"
        cancelLabel="キャンセル"
        variant="info"
        onConfirm={handleConfirm}
      />
    </main>
  )
}