'use client'
import * as React from 'react'
import { toast } from 'sonner'
import { useCreateMessageForm, type FormValues } from './useCreateMessageForm'
import { makeClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessagePreview } from '@/app/_shared/components/message-preview'
import { ConfirmDialog } from '@/app/_shared/components/confirm-dialog'
import type { SubmitHandler } from 'react-hook-form'

const client = makeClient()

export default function NewMessagePage() {
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useCreateMessageForm()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [pendingValues, setPendingValues] = React.useState<FormValues | null>(null)

  // フォーム値をリアルタイム監視
  const watchedValues = watch()

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
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
      toast.success('メッセージを配信しました')
      router.push('/messages')
    } catch (error) {
      console.error('Error creating message:', error)
      toast.error('メッセージの配信に失敗しました。もう一度お試しください。')
    } finally {
      setPendingValues(null)
      setConfirmOpen(false)
    }
  }

  return (
    <main className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/messages"
            className="text-primary hover:text-primary/90"
            aria-label="メッセージ一覧に戻る"
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
                className="mt-1 w-full rounded border border-border bg-background text-foreground px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                本文 *
              </label>
              <textarea
                id="body"
                rows={6}
                className="mt-1 w-full rounded border border-border bg-background text-foreground px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                {...register('body')}
              />
              {errors.body && (
                <p className="text-sm text-destructive mt-1">{errors.body.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                画像URL
              </label>
              <input
                id="imageUrl"
                type="url"
                className="mt-1 w-full rounded border border-border bg-background text-foreground px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                {...register('imageUrl')}
              />
              {errors.imageUrl && (
                <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                配信予定日時
              </label>
              <input
                id="scheduledAt"
                type="datetime-local"
                className="mt-1 w-full rounded border border-border bg-background text-foreground px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                {...register('scheduledAt')}
              />
              {errors.scheduledAt && (
                <p className="text-sm text-destructive mt-1">{errors.scheduledAt.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ステータス
              </label>
              <select
                id="status"
                className="mt-1 w-full rounded border border-border bg-background text-foreground px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                {...register('status')}
              >
                <option value="draft">下書き</option>
                <option value="scheduled">配信予定</option>
              </select>
              {errors.status && (
                <p className="text-sm text-destructive mt-1">{errors.status.message}</p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '配信中…' : '配信する'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/messages')}
                className="bg-muted text-muted-foreground px-4 py-2 rounded-md text-sm hover:bg-muted/80"
              >
                キャンセル
              </button>
            </div>
          </form>

          {/* 右側: プレビュー */}
          <div className="lg:sticky lg:top-6 h-fit">
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